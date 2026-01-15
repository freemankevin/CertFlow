#!/bin/bash

#==============================================
# SSL证书自动更新脚本
# 功能：备份旧证书、申请新证书、安装并验证
#==============================================

set -euo pipefail

#==============================================
# 配置区域 - 根据实际情况修改
#==============================================

# 域名配置
DOMAIN="your.domain.com"

# 路径配置
BASE_DIR="/data/opt/install-middleware"       # 基础安装目录
CERT_DIR="${BASE_DIR}/certs"                  # 证书存放目录
WEBROOT_DIR="${BASE_DIR}/html"                # Web根目录（用于ACME验证）

# acme.sh 路径
ACME_SH="${HOME}/.acme.sh/acme.sh"            # acme.sh脚本路径

# 重载命令（证书安装后执行）
RELOAD_CMD="docker restart nginx"             # 重启Nginx以应用新证书

#==============================================
# 以下为脚本逻辑，一般无需修改
#==============================================

# 颜色输出 - VS Code 风格
readonly COLOR_RESET="\033[0m"
readonly COLOR_TIMESTAMP="\033[0;90m"         # 灰色 - 时间戳
readonly COLOR_INFO="\033[0;36m"              # 青色 - INFO
readonly COLOR_SUCCESS="\033[0;32m"           # 绿色 - SUCCESS
readonly COLOR_WARNING="\033[0;33m"           # 黄色 - WARNING
readonly COLOR_ERROR="\033[0;31m"             # 红色 - ERROR
readonly COLOR_NOTICE="\033[1;36m"            # 亮青色 - NOTICE
readonly COLOR_KEY="\033[1;37m"               # 白色 - 关键信息
readonly COLOR_VALUE="\033[0;32m"             # 绿色 - 值
readonly COLOR_DIMMED="\033[0;37m"            # 淡白色 - 详细信息

#==============================================
# 日志函数
#==============================================

# 通用日志打印函数
print_log() {
    local level="$1"
    local message="$2"
    local color="$3"
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S.%3N')
    local level_padded=$(printf "%-8s" "[$level]")
    
    echo -e "${COLOR_TIMESTAMP}${timestamp}${COLOR_RESET} ${color}${level_padded}${COLOR_RESET} ${message}"
}

# 各级别日志函数
log_info() { print_log "info" "$1" "$COLOR_INFO"; }
log_success() { print_log "success" "$1" "$COLOR_SUCCESS"; }
log_warning() { print_log "warning" "$1" "$COLOR_WARNING"; }
log_error() { print_log "error" "$1" "$COLOR_ERROR"; }
log_notice() { print_log "notice" "$1" "$COLOR_NOTICE"; }

# 步骤分隔符
print_separator() {
    echo ""
    echo ""
}

#==============================================
# 步骤0: 检查系统依赖
#==============================================
check_requirements() {
    log_info "🔍 Step 1/8: 检查系统依赖..."
    
    local missing_commands=()
    
    # 检查必需的命令
    for cmd in curl openssl docker ping; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
        fi
    done
    
    # 检查acme.sh是否存在
    if [[ ! -f "${ACME_SH}" ]]; then
        missing_commands+=("acme.sh")
    fi
    
    # 如果有缺失的命令，报错退出
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_error "❌ 缺少必要的命令: ${missing_commands[*]}"
        exit 1
    fi
    
    log_success "✅ 依赖检查通过"
}

#==============================================
# 步骤1: 检查域名解析
#==============================================
check_domain_resolution() {
    log_info "📋 Step 2/8: 检查域名解析"
    
    # 解析域名IP
    log_info "  → 正在解析域名 ${COLOR_KEY}${DOMAIN}${COLOR_RESET}..."
    local resolved_ip
    resolved_ip=$(ping -c 1 "${DOMAIN}" 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1 || echo "")
    
    # 域名解析失败检查
    if [[ -z "${resolved_ip}" ]]; then
        log_error "❌ 域名解析失败: ${DOMAIN}"
        log_error "  → 请检查域名DNS配置是否正确"
        exit 1
    fi
    
    log_success "  → 域名解析成功: ${COLOR_VALUE}${resolved_ip}${COLOR_RESET}"
    
    # 获取本机公网IP - 尝试多个服务提高成功率
    log_info "  → 正在获取本机公网IP..."
    local server_ip=""
    local ip_services=(
        "http://ifconfig.me"
        "http://icanhazip.com"
        "http://ipinfo.io/ip"
        "http://api.ipify.org"
        "http://ipecho.net/plain"
        "http://myip.ipip.net"
    )
    
    # 依次尝试各个IP查询服务
    for service in "${ip_services[@]}"; do
        server_ip=$(curl -s --connect-timeout 3 --max-time 5 "${service}" 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1 || echo "")
        if [[ -n "${server_ip}" ]]; then
            log_success "  → 本机公网IP: ${COLOR_VALUE}${server_ip}${COLOR_RESET} ${COLOR_DIMMED}(来源: ${service})${COLOR_RESET}"
            break
        fi
    done
    
    # 显示解析结果汇总
    echo ""
    echo -e "${COLOR_KEY}域名解析结果：${COLOR_RESET}"
    echo "----------------------------------------"
    echo -e "  域名: ${COLOR_VALUE}${DOMAIN}${COLOR_RESET}"
    echo -e "  解析IP: ${COLOR_VALUE}${resolved_ip}${COLOR_RESET}"
    if [[ -n "${server_ip}" ]]; then
        echo -e "  本机IP: ${COLOR_VALUE}${server_ip}${COLOR_RESET}"
    fi
    echo "----------------------------------------"
    
    # 自动匹配或手动确认
    if [[ -n "${server_ip}" && "${resolved_ip}" == "${server_ip}" ]]; then
        log_success "✅ 域名解析正确，IP地址匹配！"
        return 0
    fi
    
    # IP不匹配或无法获取时，需要用户确认
    if [[ -n "${server_ip}" ]]; then
        log_warning "⚠️  域名解析的IP与本机公网IP不匹配！"
    else
        log_warning "⚠️  无法自动获取本机公网IP，请手动确认"
        log_info "  → 提示: 您可以通过以下命令手动检查："
        log_info "    ${COLOR_DIMMED}curl ifconfig.me${COLOR_RESET} 或 ${COLOR_DIMMED}curl ipinfo.io/ip${COLOR_RESET}"
    fi
    
    echo ""
    read -p "$(echo -e "${COLOR_WARNING}[warning ]${COLOR_RESET} 请确认域名解析的IP ${COLOR_VALUE}(${resolved_ip})${COLOR_RESET} 是否为本服务器的公网IP？(y/n): ")" -r confirm
    echo ""
    
    # 用户确认检查
    if [[ ! "${confirm}" =~ ^[Yy]$ ]]; then
        log_error "❌ 用户取消操作"
        log_info "  → 请先配置域名DNS解析，确保域名指向本服务器的公网IP"
        exit 1
    fi
    
    log_success "✅ 域名解析确认通过"
}

#==============================================
# 步骤2: 备份旧证书
#==============================================
backup_old_certs() {
    log_info "💾 Step 3/8: 备份旧证书"
    
    local key_file="${CERT_DIR}/${DOMAIN}.key"
    local crt_file="${CERT_DIR}/${DOMAIN}.crt"
    
    # 检查证书文件是否存在
    if [[ ! -f "${key_file}" ]] && [[ ! -f "${crt_file}" ]]; then
        log_warning "⊘  未找到旧证书，跳过备份"
        return 0
    fi
    
    # 检查证书是否即将过期（小于30天）
    local need_backup=false
    if [[ -f "${crt_file}" ]]; then
        # 使用openssl检查证书是否在30天内过期
        if ! openssl x509 -in "${crt_file}" -noout -checkend $((30*24*3600)) 2>/dev/null; then
            need_backup=true
            log_info "  → 证书将在30天内过期，需要备份"
        else
            log_info "  → 证书有效期超过30天"
        fi
    else
        need_backup=true
    fi
    
    # 只在需要更新时备份
    if [[ "${need_backup}" == "true" ]]; then
        local backup_dir="${CERT_DIR}/bak$(date +%Y%m%d%H%M)"
        mkdir -p "${backup_dir}"
        cp "${CERT_DIR}/${DOMAIN}".* "${backup_dir}/" 2>/dev/null || true
        log_success "✅ 证书已备份至: ${COLOR_VALUE}${backup_dir}${COLOR_RESET}"
    else
        log_info "  → 证书仍然有效，无需备份"
    fi
}

#==============================================
# 步骤3: 创建验证目录
#==============================================
create_verify_dir() {
    log_info "📁 Step 4/8: 创建ACME验证目录"
    
    local acme_dir="${WEBROOT_DIR}/.well-known/acme-challenge"
    mkdir -p "${acme_dir}"
    chmod 755 "${acme_dir}"
    
    log_success "✅ 验证目录已创建: ${COLOR_DIMMED}${acme_dir}${COLOR_RESET}"
}

#==============================================
# 步骤4: 测试验证路径
#==============================================
test_verify_path() {
    log_info "🧪 Step 5/8: 测试HTTP验证路径"
    
    local acme_dir="${WEBROOT_DIR}/.well-known/acme-challenge"
    local test_file="${acme_dir}/test.txt"
    local test_content="acme-test-$(date +%s)"
    
    # 创建测试文件
    log_info "  → 创建测试文件..."
    echo "${test_content}" > "${test_file}"
    sleep 1
    
    # 测试HTTP访问
    log_info "  → 测试访问 ${COLOR_DIMMED}http://${DOMAIN}/.well-known/acme-challenge/test.txt${COLOR_RESET}"
    local test_result
    test_result=$(curl -s --connect-timeout 10 "http://${DOMAIN}/.well-known/acme-challenge/test.txt" || echo "FAILED")
    
    # 清理测试文件
    rm -f "${test_file}"
    
    # 验证测试结果
    if [[ "${test_result}" != "${test_content}" ]]; then
        log_error "❌ 验证路径不可访问！"
        log_error "  → 请检查 Nginx 配置，确保以下位置可访问："
        log_error "    ${COLOR_DIMMED}http://${DOMAIN}/.well-known/acme-challenge/${COLOR_RESET}"
        exit 1
    fi
    
    log_success "✅ 验证路径测试通过"
}

#==============================================
# 步骤5: 申请证书
#==============================================
issue_certificate() {
    log_info "🔐 Step 6/8: 申请SSL证书"
    
    # 检查证书是否已存在且有效
    local cert_file="${CERT_DIR}/${DOMAIN}.crt"
    if [[ -f "${cert_file}" ]]; then
        log_info "  → 检查现有证书有效期..."
        
        # 检查证书是否还有30天以上有效期
        if openssl x509 -in "${cert_file}" -noout -checkend $((30*24*3600)) 2>/dev/null; then
            local expire_date
            expire_date=$(openssl x509 -in "${cert_file}" -noout -enddate | cut -d= -f2)
            log_warning "⊘  证书仍然有效 ${COLOR_DIMMED}(到期: ${expire_date})${COLOR_RESET}，跳过申请"
            log_info "  → 如需强制更新，请先删除: ${COLOR_DIMMED}${cert_file}${COLOR_RESET}"
            return 0
        else
            log_info "  → 证书将在30天内过期，需要续期"
        fi
    fi
    
    # 开始申请证书
    log_info "  → 开始向证书颁发机构申请证书..."
    echo ""
    
    # 使用 --force 参数避免重复申请错误，并将输出美化
    if ! "${ACME_SH}" --issue -d "${DOMAIN}" --webroot "${WEBROOT_DIR}" --force 2>&1 | while IFS= read -r line; do
        echo -e "${COLOR_DIMMED}    ${line}${COLOR_RESET}"
    done; then
        echo ""
        log_error "❌ 证书申请失败"
        exit 1
    fi
    
    echo ""
    log_success "✅ 证书申请成功"
}

#==============================================
# 步骤6: 安装证书
#==============================================
install_certificate() {
    log_info "📦 Step 7/8: 安装SSL证书"
    
    log_info "  → 安装证书到: ${COLOR_VALUE}${CERT_DIR}${COLOR_RESET}"
    echo ""
    
    # 安装证书并重载服务
    if ! "${ACME_SH}" --install-cert -d "${DOMAIN}" \
        --key-file "${CERT_DIR}/${DOMAIN}.key" \
        --fullchain-file "${CERT_DIR}/${DOMAIN}.crt" \
        --reloadcmd "${RELOAD_CMD}" 2>&1 | while IFS= read -r line; do
        echo -e "${COLOR_DIMMED}    ${line}${COLOR_RESET}"
    done; then
        echo ""
        log_error "❌ 证书安装失败"
        exit 1
    fi
    
    echo ""
    log_success "✅ 证书已安装并重载服务"
}

#==============================================
# 步骤7: 验证证书
#==============================================
verify_certificate() {
    log_info "🔍 Step 8/8: 验证证书信息"
    
    # 检查证书文件是否存在
    if [[ ! -f "${CERT_DIR}/${DOMAIN}.crt" ]]; then
        log_error "❌ 证书文件不存在: ${CERT_DIR}/${DOMAIN}.crt"
        exit 1
    fi
    
    echo ""
    echo -e "${COLOR_KEY}证书详细信息：${COLOR_RESET}"
    echo "----------------------------------------"
    
    # 提取并高亮显示关键信息
    local subject
    local issuer
    local not_before
    local not_after
    
    subject=$(openssl x509 -in "${CERT_DIR}/${DOMAIN}.crt" -noout -subject | sed 's/subject=//')
    issuer=$(openssl x509 -in "${CERT_DIR}/${DOMAIN}.crt" -noout -issuer | sed 's/issuer=//')
    not_before=$(openssl x509 -in "${CERT_DIR}/${DOMAIN}.crt" -noout -startdate | sed 's/notBefore=//')
    not_after=$(openssl x509 -in "${CERT_DIR}/${DOMAIN}.crt" -noout -enddate | sed 's/notAfter=//')
    
    echo -e "  域名: ${COLOR_VALUE}${subject}${COLOR_RESET}"
    echo -e "  颁发者: ${COLOR_DIMMED}${issuer}${COLOR_RESET}"
    echo -e "  生效日期: ${COLOR_VALUE}${not_before}${COLOR_RESET}"
    echo -e "  到期日期: ${COLOR_VALUE}${not_after}${COLOR_RESET}"
    echo "----------------------------------------"
    
    log_success "✅ 证书验证通过"
}

#==============================================
# 主函数
#==============================================
main() {
    # 清屏
    clear
    
echo -e "\033[1;97m"
cat <<'EOF'
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         ACME SSL BREEZE                          ┃
┃                   One-Shot · Zero-Worry · Always-On              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
EOF
echo -e "\033[90m$(date '+%Y-%m-%d %H:%M:%S')  \033[37mSSL RENEWAL ROUTINE INITIALIZED\033[0m\n"
    
    # 执行各个步骤，步骤之间用分隔符分开
    check_requirements
    
    print_separator
    check_domain_resolution
    
    print_separator
    backup_old_certs
    
    print_separator
    create_verify_dir
    
    print_separator
    test_verify_path
    
    print_separator
    issue_certificate
    
    print_separator
    install_certificate
    
    print_separator
    verify_certificate
    
    echo ""
    log_success "🎉 证书更新完成！"
    echo ""
}

#==============================================
# 错误处理
#==============================================
trap 'log_error "❌ 脚本执行失败，退出码: $?"' ERR

#==============================================
# 执行主函数
#==============================================
main "$@"