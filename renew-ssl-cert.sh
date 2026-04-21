#!/bin/bash

#==============================================
# CertFlow - SSL证书自动更新脚本
# 功能：备份旧证书、申请新证书、安装并验证
# 支持：多域名、DNS-API/WebRoot双验证、Webhook通知
#==============================================

set -euo pipefail

#==============================================
# 版本信息
#==============================================
# shellcheck disable=SC2034
readonly SCRIPT_VERSION="2.0.0"
# shellcheck disable=SC2034
readonly SCRIPT_NAME="CertFlow"

#==============================================
# 默认配置（可被配置文件覆盖）
#==============================================
DOMAINS=""
BASE_DIR="/data/opt/installmiddleware"
CERT_DIR=""
WEBROOT_DIR=""
ACME_SH="${HOME}/.acme.sh/acme.sh"
RELOAD_CMD="docker restart nginx"

VERIFY_MODE="webroot"
DNS_API_PROVIDER=""
DNS_API_KEY=""
DNS_API_SECRET=""

WEBHOOK_URL=""
WEBHOOK_TYPE="wechat"

ENABLE_LOG=false
LOG_DIR=""
DRY_RUN=false
CERT_KEY_LENGTH="2048"
CA_SERVER="letsencrypt"
RENEW_THRESHOLD_DAYS=30
SKIP_DNS_CHECK=false

NGINX_CONF_PATH=""
AUTO_UPDATE_NGINX_DOMAIN=false

#==============================================
# 运行时变量
#==============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/ssl-cert.conf"
LOG_FILE=""
# shellcheck disable=SC2034
CURRENT_DOMAIN=""
STATS_TOTAL=0
STATS_SUCCESS=0
STATS_FAILED=0
STATS_SKIPPED=0

#==============================================
# 颜色输出
#==============================================
readonly COLOR_RESET="\033[0m"
readonly COLOR_TIMESTAMP="\033[0;90m"
readonly COLOR_INFO="\033[0;36m"
readonly COLOR_SUCCESS="\033[0;32m"
readonly COLOR_WARNING="\033[0;33m"
readonly COLOR_ERROR="\033[0;31m"
readonly COLOR_NOTICE="\033[1;36m"
readonly COLOR_KEY="\033[1;37m"
readonly COLOR_VALUE="\033[0;32m"
readonly COLOR_DIMMED="\033[0;37m"
readonly COLOR_DOMAIN="\033[1;35m"

#==============================================
# 日志函数
#==============================================
print_log() {
    local level="$1"
    local message="$2"
    local color="$3"
    
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S.%3N')
    local level_padded
    level_padded=$(printf "%-8s" "[$level]")
    
    echo -e "${COLOR_TIMESTAMP}${timestamp}${COLOR_RESET} ${color}${level_padded}${COLOR_RESET} ${message}"
    
    if [[ "${ENABLE_LOG}" == "true" && -n "${LOG_FILE}" ]]; then
        echo "[${timestamp}] [${level}] ${message}" >> "${LOG_FILE}"
    fi
}

log_info() { print_log "info" "$1" "$COLOR_INFO"; }
log_success() { print_log "success" "$1" "$COLOR_SUCCESS"; }
log_warning() { print_log "warning" "$1" "$COLOR_WARNING"; }
log_error() { print_log "error" "$1" "$COLOR_ERROR"; }
log_notice() { print_log "notice" "$1" "$COLOR_NOTICE"; }
log_domain() { print_log "domain" "$1" "$COLOR_DOMAIN"; }

print_separator() {
    echo ""
}

print_header() {
    local title="$1"
    echo ""
    echo -e "${COLOR_KEY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR_RESET}"
    echo -e "${COLOR_KEY}  ${title}${COLOR_RESET}"
    echo -e "${COLOR_KEY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR_RESET}"
}

#==============================================
# 配置加载
#==============================================
load_config() {
    if [[ ! -f "${CONFIG_FILE}" ]]; then
        log_error "配置文件不存在: ${CONFIG_FILE}"
        log_info "请复制 ssl-cert.conf.example 为 ssl-cert.conf 并修改配置"
        exit 1
    fi
    
    log_info "加载配置文件: ${CONFIG_FILE}"
    
    # shellcheck source=/dev/null
    source "${CONFIG_FILE}"
    
    # 设置默认值
    if [[ -z "${CERT_DIR}" ]]; then
        CERT_DIR="${BASE_DIR}/certs"
    fi
    if [[ -z "${WEBROOT_DIR}" ]]; then
        WEBROOT_DIR="${BASE_DIR}/html"
    fi
    if [[ -z "${LOG_DIR}" ]]; then
        LOG_DIR="${BASE_DIR}/logs"
    fi
    
    # 验证必填配置
    if [[ -z "${DOMAINS}" ]]; then
        log_error "配置错误: DOMAINS 未设置"
        exit 1
    fi
    
    # 验证 DNS API 配置
    if [[ "${VERIFY_MODE}" == "dns" ]]; then
        if [[ -z "${DNS_API_PROVIDER}" ]]; then
            log_error "配置错误: VERIFY_MODE=dns 但 DNS_API_PROVIDER 未设置"
            exit 1
        fi
        if [[ -z "${DNS_API_KEY}" || -z "${DNS_API_SECRET}" ]]; then
            log_error "配置错误: VERIFY_MODE=dns 但 DNS_API_KEY 或 DNS_API_SECRET 未设置"
            exit 1
        fi
    fi
    
    log_success "配置加载完成"
}

#==============================================
# 显示配置摘要
#==============================================
show_config_summary() {
    echo ""
    echo -e "${COLOR_KEY}配置摘要：${COLOR_RESET}"
    echo "----------------------------------------"
    echo -e "  域名列表: ${COLOR_VALUE}${DOMAINS}${COLOR_RESET}"
    echo -e "  验证模式: ${COLOR_VALUE}${VERIFY_MODE}${COLOR_RESET}"
    echo -e "  证书目录: ${COLOR_VALUE}${CERT_DIR}${COLOR_RESET}"
    echo -e "  重载命令: ${COLOR_VALUE}${RELOAD_CMD}${COLOR_RESET}"
    
    if [[ -n "${WEBHOOK_URL}" ]]; then
        echo -e "  Webhook: ${COLOR_VALUE}${WEBHOOK_TYPE}${COLOR_RESET}"
    fi
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        echo -e "  运行模式: ${COLOR_WARNING}DRY-RUN (测试模式)${COLOR_RESET}"
    fi
    
    echo "----------------------------------------"
}

#==============================================
# 检查并更新 Nginx 配置文件中的域名
#==============================================
check_nginx_config_domain() {
    print_header "检查业务路由配置"
    
    if [[ -z "${NGINX_CONF_PATH}" ]]; then
        log_info "未配置业务路由文件路径，跳过检查"
        return 0
    fi
    
    if [[ ! -f "${NGINX_CONF_PATH}" ]]; then
        log_warning "配置文件不存在: ${NGINX_CONF_PATH}"
        return 0
    fi
    
    local main_domain="${DOMAINS%%,*}"
    main_domain="${main_domain%% *}"
    main_domain=$(echo "$main_domain" | xargs)
    
    if [[ -z "${main_domain}" ]]; then
        log_warning "无法获取主域名"
        return 0
    fi
    
    log_info "主域名: ${main_domain}"
    log_info "配置文件: ${NGINX_CONF_PATH}"
    
    local old_domain_pattern='your\.domain\.com|example\.com|localhost'
    local domain_found=false
    local needs_update=false
    
    if grep -qiE "${old_domain_pattern}" "${NGINX_CONF_PATH}"; then
        domain_found=true
        needs_update=true
        log_warning "发现示例域名占位符"
    fi
    
    if grep -qi "${main_domain}" "${NGINX_CONF_PATH}"; then
        domain_found=true
        if ! needs_update; then
            log_success "配置文件已使用正确域名: ${main_domain}"
        fi
    else
        if ! "${domain_found}"; then
            log_warning "配置文件未找到域名配置"
        fi
    fi
    
    if [[ "${needs_update}" == "true" && "${AUTO_UPDATE_NGINX_DOMAIN}" == "true" ]]; then
        log_info "自动更新配置文件域名..."
        
        sed -i.bak -E "s/(your\.domain\.com|example\.com|localhost)/${main_domain}/gi" "${NGINX_CONF_PATH}"
        
        if [[ -f "${NGINX_CONF_PATH}.bak" ]]; then
            rm -f "${NGINX_CONF_PATH}.bak"
        fi
        
        log_success "配置文件域名已更新为: ${main_domain}"
    elif [[ "${needs_update}" == "true" && "${AUTO_UPDATE_NGINX_DOMAIN}" != "true" ]]; then
        log_warning "配置文件需要手动更新域名"
        log_info "建议: 将 your.domain.com 替换为 ${main_domain}"
        log_info "或启用 AUTO_UPDATE_NGINX_DOMAIN=true 自动更新"
    fi
    
    return 0
}

#==============================================
# 检查系统依赖
#==============================================
check_requirements() {
    print_header "检查系统依赖"
    
    local missing_commands=()
    
    for cmd in curl openssl; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [[ "${VERIFY_MODE}" == "webroot" ]]; then
        if ! command -v ping &> /dev/null; then
            missing_commands+=("ping")
        fi
    fi
    
    if [[ "${RELOAD_CMD}" == docker* ]]; then
        if ! command -v docker &> /dev/null; then
            missing_commands+=("docker")
        fi
    fi
    
    if [[ ! -f "${ACME_SH}" ]]; then
        missing_commands+=("acme.sh (${ACME_SH})")
    fi
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_error "缺少必要的命令: ${missing_commands[*]}"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

#==============================================
# DNS API 环境设置
#==============================================
setup_dns_api_env() {
    case "${DNS_API_PROVIDER}" in
        dns_ali)
            export Ali_Key="${DNS_API_KEY}"
            export Ali_Secret="${DNS_API_SECRET}"
            ;;
        dns_cf)
            export CF_Key="${DNS_API_KEY}"
            export CF_Email="${DNS_API_SECRET}"
            ;;
        dns_dp)
            export DP_Id="${DNS_API_KEY}"
            export DP_Key="${DNS_API_SECRET}"
            ;;
        dns_aws)
            export AWS_ACCESS_KEY_ID="${DNS_API_KEY}"
            export AWS_SECRET_ACCESS_KEY="${DNS_API_SECRET}"
            ;;
        *)
            log_error "不支持的 DNS API 提供商: ${DNS_API_PROVIDER}"
            log_info "支持列表: dns_ali, dns_cf, dns_dp, dns_aws"
            exit 1
            ;;
    esac
    
    log_success "DNS API 环境变量已设置 (${DNS_API_PROVIDER})"
}

#==============================================
# 域名解析检查
#==============================================
check_domain_resolution() {
    local domain="$1"
    
    if [[ "${SKIP_DNS_CHECK}" == "true" ]]; then
        log_warning "已跳过域名解析检查"
        return 0
    fi
    
    log_info "检查域名解析: ${COLOR_KEY}${domain}${COLOR_RESET}"
    
    local resolved_ip
    resolved_ip=$(ping -c 1 "${domain}" 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1 || echo "")
    
    if [[ -z "${resolved_ip}" ]]; then
        log_error "域名解析失败: ${domain}"
        return 1
    fi
    
    log_success "域名解析成功: ${COLOR_VALUE}${resolved_ip}${COLOR_RESET}"
    
    local server_ip=""
    local ip_services=(
        "http://ifconfig.me"
        "http://icanhazip.com"
        "http://ipinfo.io/ip"
        "http://api.ipify.org"
    )
    
    for service in "${ip_services[@]}"; do
        server_ip=$(curl -s --connect-timeout 3 --max-time 5 "${service}" 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1 || echo "")
        if [[ -n "${server_ip}" ]]; then
            break
        fi
    done
    
    if [[ -n "${server_ip}" && "${resolved_ip}" == "${server_ip}" ]]; then
        log_success "域名IP与本机IP匹配"
        return 0
    fi
    
    log_warning "域名IP (${resolved_ip}) 与本机IP (${server_ip:-未知}) 不匹配"
    log_info "如使用 CDN 或负载均衡，可设置 SKIP_DNS_CHECK=true"
    
    return 0
}

#==============================================
# 备份旧证书
#==============================================
backup_old_certs() {
    local domain="$1"
    
    log_info "备份旧证书: ${COLOR_KEY}${domain}${COLOR_RESET}"
    
    local key_file="${CERT_DIR}/${domain}.key"
    local crt_file="${CERT_DIR}/${domain}.crt"
    
    if [[ ! -f "${key_file}" ]] && [[ ! -f "${crt_file}" ]]; then
        log_warning "未找到旧证书，跳过备份"
        return 0
    fi
    
    local backup_dir
    backup_dir="${CERT_DIR}/bak$(date +%Y%m%d%H%M%S)"
    mkdir -p "${backup_dir}"
    
    cp "${CERT_DIR}/${domain}".* "${backup_dir}/" 2>/dev/null || true
    
    log_success "证书已备份至: ${COLOR_VALUE}${backup_dir}${COLOR_RESET}"
}

#==============================================
# 检查证书有效期
#==============================================
check_cert_expiry() {
    local domain="$1"
    local cert_file="${CERT_DIR}/${domain}.crt"
    
    if [[ ! -f "${cert_file}" ]]; then
        echo "0"
        return
    fi
    
    local expire_seconds=$((RENEW_THRESHOLD_DAYS * 24 * 3600))
    
    if openssl x509 -in "${cert_file}" -noout -checkend "${expire_seconds}" 2>/dev/null; then
        echo "1"
    else
        echo "0"
    fi
}

#==============================================
# 创建验证目录
#==============================================
create_verify_dir() {
    if [[ "${VERIFY_MODE}" != "webroot" ]]; then
        return 0
    fi
    
    log_info "创建 ACME 验证目录"
    
    local acme_dir="${WEBROOT_DIR}/.well-known/acme-challenge"
    mkdir -p "${acme_dir}"
    chmod 755 "${acme_dir}"
    
    log_success "验证目录已创建: ${COLOR_DIMMED}${acme_dir}${COLOR_RESET}"
}

#==============================================
# 测试验证路径
#==============================================
test_verify_path() {
    local domain="$1"
    
    if [[ "${VERIFY_MODE}" != "webroot" ]]; then
        return 0
    fi
    
    log_info "测试 HTTP 验证路径"
    
    local acme_dir="${WEBROOT_DIR}/.well-known/acme-challenge"
    local test_file
    test_file="${acme_dir}/test.txt"
    local test_content="acme-test-$(date +%s)"
    
    echo "${test_content}" > "${test_file}"
    sleep 1
    
    local test_result
    test_result=$(curl -s --connect-timeout 10 "http://${domain}/.well-known/acme-challenge/test.txt" || echo "FAILED")
    
    rm -f "${test_file}"
    
    if [[ "${test_result}" != "${test_content}" ]]; then
        log_error "验证路径不可访问: http://${domain}/.well-known/acme-challenge/"
        return 1
    fi
    
    log_success "验证路径测试通过"
}

#==============================================
# 申请证书
#==============================================
issue_certificate() {
    local domain="$1"
    local domains_list="$2"
    
    log_info "申请 SSL 证书: ${COLOR_KEY}${domain}${COLOR_RESET}"
    
    local cert_valid
    cert_valid=$(check_cert_expiry "${domain}")
    
    if [[ "${cert_valid}" == "1" ]]; then
        local expire_date
        expire_date=$(openssl x509 -in "${CERT_DIR}/${domain}.crt" -noout -enddate 2>/dev/null | cut -d= -f2 || echo "未知")
        log_warning "证书仍然有效 (到期: ${expire_date})，跳过申请"
        ((STATS_SKIPPED++)) || true
        return 0
    fi
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_warning "[DRY-RUN] 跳过实际证书申请"
        ((STATS_SUCCESS++)) || true
        return 0
    fi
    
    local acme_args=()
    acme_args+=("--issue")
    
    # 解析域名列表
    IFS=',' read -ra domain_array <<< "${domains_list}"
    for d in "${domain_array[@]}"; do
        d=$(echo "$d" | xargs)
        acme_args+=("-d" "${d}")
    done
    
    # 验证模式
    if [[ "${VERIFY_MODE}" == "dns" ]]; then
        acme_args+=("--dns" "${DNS_API_PROVIDER}")
    else
        acme_args+=("--webroot" "${WEBROOT_DIR}")
    fi
    
    acme_args+=("--keylength" "${CERT_KEY_LENGTH}")
    acme_args+=("--force")
    
    # CA 服务器
    case "${CA_SERVER}" in
        zerossl)
            acme_args+=("--server" "zerossl")
            ;;
        buypass)
            acme_args+=("--server" "buypass")
            ;;
    esac
    
    log_info "执行: ${ACME_SH} ${acme_args[*]}"
    
    if ! "${ACME_SH}" "${acme_args[@]}" 2>&1 | while IFS= read -r line; do
        echo -e "${COLOR_DIMMED}    ${line}${COLOR_RESET}"
    done; then
        log_error "证书申请失败"
        ((STATS_FAILED++)) || true
        return 1
    fi
    
    log_success "证书申请成功"
    ((STATS_SUCCESS++)) || true
}

#==============================================
# 安装证书
#==============================================
install_certificate() {
    local domain="$1"
    
    log_info "安装 SSL 证书: ${COLOR_KEY}${domain}${COLOR_RESET}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_warning "[DRY-RUN] 跳过证书安装"
        return 0
    fi
    
    mkdir -p "${CERT_DIR}"
    
    if ! "${ACME_SH}" --install-cert -d "${domain}" \
        --key-file "${CERT_DIR}/${domain}.key" \
        --fullchain-file "${CERT_DIR}/${domain}.crt" \
        --reloadcmd "${RELOAD_CMD}" 2>&1 | while IFS= read -r line; do
        echo -e "${COLOR_DIMMED}    ${line}${COLOR_RESET}"
    done; then
        log_error "证书安装失败"
        return 1
    fi
    
    log_success "证书已安装并重载服务"
}

#==============================================
# 验证证书
#==============================================
verify_certificate() {
    local domain="$1"
    
    log_info "验证证书信息: ${COLOR_KEY}${domain}${COLOR_RESET}"
    
    local cert_file="${CERT_DIR}/${domain}.crt"
    
    if [[ ! -f "${cert_file}" ]]; then
        log_error "证书文件不存在: ${cert_file}"
        return 1
    fi
    
    echo ""
    echo -e "${COLOR_KEY}证书详细信息：${COLOR_RESET}"
    echo "----------------------------------------"
    
    local subject issuer not_before not_after
    
    subject=$(openssl x509 -in "${cert_file}" -noout -subject 2>/dev/null | sed 's/subject=//' || echo "未知")
    issuer=$(openssl x509 -in "${cert_file}" -noout -issuer 2>/dev/null | sed 's/issuer=//' || echo "未知")
    not_before=$(openssl x509 -in "${cert_file}" -noout -startdate 2>/dev/null | sed 's/notBefore=//' || echo "未知")
    not_after=$(openssl x509 -in "${cert_file}" -noout -enddate 2>/dev/null | sed 's/notAfter=//' || echo "未知")
    
    echo -e "  域名: ${COLOR_VALUE}${subject}${COLOR_RESET}"
    echo -e "  颁发者: ${COLOR_DIMMED}${issuer}${COLOR_RESET}"
    echo -e "  生效日期: ${COLOR_VALUE}${not_before}${COLOR_RESET}"
    echo -e "  到期日期: ${COLOR_VALUE}${not_after}${COLOR_RESET}"
    echo "----------------------------------------"
    
    log_success "证书验证通过"
}

#==============================================
# Webhook 通知
#==============================================
send_webhook_notification() {
    local status="$1"
    local domain="$2"
    local message="$3"
    
    if [[ -z "${WEBHOOK_URL}" ]]; then
        return 0
    fi
    
    log_info "发送 Webhook 通知..."
    
    local payload=""
    local content=""
    
    case "${WEBHOOK_TYPE}" in
        wechat)
            content="## CertFlow 证书更新通知\n\n**状态**: ${status}\n**域名**: ${domain}\n**时间**: $(date '+%Y-%m-%d %H:%M:%S')\n\n${message}"
            payload=$(cat <<EOF
{
    "msgtype": "markdown",
    "markdown": {
        "content": "${content}"
    }
}
EOF
)
            ;;
        dingtalk)
            content="### CertFlow 证书更新通知\n\n**状态**: ${status}\n\n**域名**: ${domain}\n\n**时间**: $(date '+%Y-%m-%d %H:%M:%S')\n\n${message}"
            payload=$(cat <<EOF
{
    "msgtype": "markdown",
    "markdown": {
        "title": "CertFlow 通知",
        "text": "${content}"
    }
}
EOF
)
            ;;
        slack)
            local color="good"
            [[ "${status}" == "失败" ]] && color="danger"
            [[ "${status}" == "跳过" ]] && color="warning"
            payload=$(cat <<EOF
{
    "attachments": [{
        "color": "${color}",
        "title": "CertFlow 证书更新通知",
        "fields": [
            {"title": "状态", "value": "${status}", "short": true},
            {"title": "域名", "value": "${domain}", "short": true},
            {"title": "时间", "value": "$(date '+%Y-%m-%d %H:%M:%S')", "short": false}
        ],
        "text": "${message}"
    }]
}
EOF
)
            ;;
        discord)
            local color=3066993
            [[ "${status}" == "失败" ]] && color=15158332
            [[ "${status}" == "跳过" ]] && color=16776960
            payload=$(cat <<EOF
{
    "embeds": [{
        "title": "CertFlow 证书更新通知",
        "color": ${color},
        "fields": [
            {"name": "状态", "value": "${status}", "inline": true},
            {"name": "域名", "value": "${domain}", "inline": true},
            {"name": "时间", "value": "$(date '+%Y-%m-%d %H:%M:%S')", "inline": false}
        ],
        "description": "${message}"
    }]
}
EOF
)
            ;;
        custom)
            payload=$(cat <<EOF
{
    "status": "${status}",
    "domain": "${domain}",
    "time": "$(date '+%Y-%m-%d %H:%M:%S')",
    "message": "${message}"
}
EOF
)
            ;;
    esac
    
    if curl -s -X POST -H "Content-Type: application/json" -d "${payload}" "${WEBHOOK_URL}" > /dev/null 2>&1; then
        log_success "Webhook 通知发送成功"
    else
        log_warning "Webhook 通知发送失败"
    fi
}

#==============================================
# 处理单个域名
#==============================================
process_domain() {
    local domain_entry="$1"
    
    # 解析域名（取第一个作为主域名）
    local main_domain
    main_domain=$(echo "${domain_entry}" | awk '{print $1}' | tr -d ',' | head -1)
    
    CURRENT_DOMAIN="${main_domain}"
    
    print_separator
    print_header "处理域名: ${main_domain}"
    ((STATS_TOTAL++)) || true
    
    local webhook_status="成功"
    local webhook_message=""
    
    # 步骤1: 检查域名解析
    if ! check_domain_resolution "${main_domain}"; then
        webhook_status="失败"
        webhook_message="域名解析检查失败"
        send_webhook_notification "${webhook_status}" "${main_domain}" "${webhook_message}"
        ((STATS_FAILED++)) || true
        return 1
    fi
    
    # 步骤2: 备份旧证书
    backup_old_certs "${main_domain}"
    
    # 步骤3: 创建验证目录
    create_verify_dir
    
    # 步骤4: 测试验证路径
    if ! test_verify_path "${main_domain}"; then
        webhook_status="失败"
        webhook_message="HTTP 验证路径不可访问"
        send_webhook_notification "${webhook_status}" "${main_domain}" "${webhook_message}"
        ((STATS_FAILED++)) || true
        return 1
    fi
    
    # 步骤5: 申请证书
    if ! issue_certificate "${main_domain}" "${domain_entry}"; then
        webhook_status="失败"
        webhook_message="证书申请失败"
        send_webhook_notification "${webhook_status}" "${main_domain}" "${webhook_message}"
        return 1
    fi
    
    # 检查是否跳过
    local cert_valid
    cert_valid=$(check_cert_expiry "${main_domain}")
    if [[ "${cert_valid}" == "1" && -f "${CERT_DIR}/${main_domain}.crt" ]]; then
        webhook_status="跳过"
        webhook_message="证书仍然有效，无需续期"
        send_webhook_notification "${webhook_status}" "${main_domain}" "${webhook_message}"
        return 0
    fi
    
    # 步骤6: 安装证书
    if ! install_certificate "${main_domain}"; then
        webhook_status="失败"
        webhook_message="证书安装失败"
        send_webhook_notification "${webhook_status}" "${main_domain}" "${webhook_message}"
        ((STATS_FAILED++)) || true
        return 1
    fi
    
    # 步骤7: 验证证书
    if ! verify_certificate "${main_domain}"; then
        webhook_status="失败"
        webhook_message="证书验证失败"
        send_webhook_notification "${webhook_status}" "${main_domain}" "${webhook_message}"
        return 1
    fi
    
    webhook_message="证书更新成功"
    send_webhook_notification "${webhook_status}" "${main_domain}" "${webhook_message}"
    
    return 0
}

#==============================================
# 显示统计信息
#==============================================
show_stats() {
    print_separator
    print_header "执行统计"
    
    echo ""
    echo -e "  总计: ${COLOR_VALUE}${STATS_TOTAL}${COLOR_RESET} 个域名"
    echo -e "  成功: ${COLOR_SUCCESS}${STATS_SUCCESS}${COLOR_RESET}"
    echo -e "  跳过: ${COLOR_WARNING}${STATS_SKIPPED}${COLOR_RESET}"
    echo -e "  失败: ${COLOR_ERROR}${STATS_FAILED}${COLOR_RESET}"
    echo ""
    
    if [[ "${STATS_FAILED}" -gt 0 ]]; then
        log_error "部分域名处理失败"
        return 1
    fi
    
    log_success "所有域名处理完成"
    return 0
}

#==============================================
# 主函数
#==============================================
main() {
    clear
    
    echo -e "\033[1;97m"
    cat <<'EOF'
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         CertFlow v2.0                             ┃
┃              SSL Certificate Auto Renewal Tool                    ┃
┃                   One-Shot · Zero-Worry · Always-On              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
EOF
    echo -e "\033[90m$(date '+%Y-%m-%d %H:%M:%S')  \033[37mSSL RENEWAL ROUTINE INITIALIZED\033[0m"
    
    # 加载配置
    print_separator
    load_config
    
    # 显示配置摘要
    show_config_summary
    
    # 检查依赖
    print_separator
    check_requirements
    
    # 检查并更新业务路由配置
    print_separator
    check_nginx_config_domain
    
    # 设置 DNS API 环境
    if [[ "${VERIFY_MODE}" == "dns" ]]; then
        print_separator
        setup_dns_api_env
    fi
    
    # 初始化日志
    if [[ "${ENABLE_LOG}" == "true" ]]; then
        mkdir -p "${LOG_DIR}"
        LOG_FILE="${LOG_DIR}/certflow-$(date +%Y%m%d).log"
        log_info "日志文件: ${LOG_FILE}"
    fi
    
    # 处理域名列表（支持空格、逗号、换行分隔）
    local domains_array=()
    
    # 将多种分隔符统一处理
    IFS=',' read -ra temp_array <<< "${DOMAINS}"
    for entry in "${temp_array[@]}"; do
        entry=$(echo "$entry" | xargs)
        if [[ -n "${entry}" ]]; then
            domains_array+=("${entry}")
        fi
    done
    
    # 处理每个域名
    for domain_entry in "${domains_array[@]}"; do
        process_domain "${domain_entry}" || true
    done
    
    # 显示统计
    show_stats
    
    echo ""
    log_success "🎉 证书更新流程完成！"
    echo ""
}

#==============================================
# 错误处理
#==============================================
trap 'log_error "脚本执行失败，退出码: $?"; exit 1' ERR

#==============================================
# 执行主函数
#==============================================
main "$@"