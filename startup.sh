#!/bin/bash

#==============================================
# CertFlow 开发环境启动脚本
# 功能：依赖安装、代码检查、端口清理、开发服务器启动
#==============================================

set -euo pipefail

#==============================================
# 颜色输出 - VS Code 风格
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

#==============================================
# 配置区域
#==============================================

readonly DEV_PORT=5173
readonly PROJECT_NAME="CertFlow"
readonly NODE_MIN_VERSION=18
readonly NPM_MIN_VERSION=9

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
}

log_info() { print_log "info" "$1" "$COLOR_INFO"; }
log_success() { print_log "success" "$1" "$COLOR_SUCCESS"; }
log_warning() { print_log "warning" "$1" "$COLOR_WARNING"; }
log_error() { print_log "error" "$1" "$COLOR_ERROR"; }
log_notice() { print_log "notice" "$1" "$COLOR_NOTICE"; }

print_separator() {
    echo ""
    echo -e "${COLOR_DIMMED}────────────────────────────────────────────────────────────────${COLOR_RESET}"
}

print_header() {
    echo ""
    echo -e "${COLOR_KEY}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${COLOR_RESET}"
    echo -e "${COLOR_KEY}┃                    ${PROJECT_NAME} DEV STARTUP                        ┃${COLOR_RESET}"
    echo -e "${COLOR_KEY}┃              Install · Check · Clean · Start                     ┃${COLOR_RESET}"
    echo -e "${COLOR_KEY}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${COLOR_RESET}"
    echo ""
}

#==============================================
# 系统检测
#==============================================

detect_system() {
    log_info "🔍 Step 1/6: 检测系统环境..."
    
    local os_type=""
    local arch_type=""
    
    case "$(uname -s)" in
        Linux*)     os_type="Linux" ;;
        Darwin*)    os_type="macOS" ;;
        CYGWIN*)    os_type="Windows (Cygwin)" ;;
        MINGW*)     os_type="Windows (MinGW)" ;;
        MSYS*)      os_type="Windows (MSYS)" ;;
        *)          os_type="Unknown" ;;
    esac
    
    case "$(uname -m)" in
        x86_64|amd64)   arch_type="x64" ;;
        arm64|aarch64)  arch_type="ARM64" ;;
        armv7l)         arch_type="ARMv7" ;;
        i386|i686)      arch_type="x86" ;;
        *)              arch_type="Unknown" ;;
    esac
    
    log_success "  → 操作系统: ${COLOR_VALUE}${os_type}${COLOR_RESET}"
    log_success "  → 系统架构: ${COLOR_VALUE}${arch_type}${COLOR_RESET}"
    
    if [[ "$os_type" == "Unknown" ]]; then
        log_warning "⚠️  未知的操作系统类型"
    fi
    
    if [[ "$arch_type" == "Unknown" ]]; then
        log_warning "⚠️  未知的系统架构"
    fi
    
    echo ""
}

#==============================================
# Node/NPM 版本检查
#==============================================

check_node_version() {
    log_info "📦 Step 2/6: 检查 Node.js 环境..."
    
    if ! command -v node &> /dev/null; then
        log_error "❌ Node.js 未安装"
        log_info "  → 请访问 ${COLOR_DIMMED}https://nodejs.org${COLOR_RESET} 下载安装"
        log_info "  → 推荐版本: Node.js ${NODE_MIN_VERSION}+"
        exit 1
    fi
    
    local node_version
    node_version=$(node -v | sed 's/v//')
    local node_major
    node_major=$(echo "$node_version" | cut -d. -f1)
    
    if [[ "$node_major" -lt "$NODE_MIN_VERSION" ]]; then
        log_error "❌ Node.js 版本过低: ${COLOR_VALUE}${node_version}${COLOR_RESET}"
        log_info "  → 当前需要: Node.js ${NODE_MIN_VERSION}+"
        exit 1
    fi
    
    log_success "  → Node.js 版本: ${COLOR_VALUE}${node_version}${COLOR_RESET} ${COLOR_DIMMED}(✓ >= ${NODE_MIN_VERSION})${COLOR_RESET}"
    
    if ! command -v npm &> /dev/null; then
        log_error "❌ npm 未安装"
        exit 1
    fi
    
    local npm_version
    npm_version=$(npm -v)
    local npm_major
    npm_major=$(echo "$npm_version" | cut -d. -f1)
    
    if [[ "$npm_major" -lt "$NPM_MIN_VERSION" ]]; then
        log_warning "⚠️  npm 版本较低: ${COLOR_VALUE}${npm_version}${COLOR_RESET}"
        log_info "  → 推荐版本: npm ${NPM_MIN_VERSION}+"
    else
        log_success "  → npm 版本: ${COLOR_VALUE}${npm_version}${COLOR_RESET} ${COLOR_DIMMED}(✓ >= ${NPM_MIN_VERSION})${COLOR_RESET}"
    fi
    
    echo ""
}

#==============================================
# 端口占用清理
#==============================================

clean_port() {
    log_info "🧹 Step 3/6: 检查端口占用..."
    
    local port_process=""
    
    case "$(uname -s)" in
        Linux|Darwin)
            port_process=$(lsof -ti:$DEV_PORT 2>/dev/null || echo "")
            ;;
        MINGW*|MSYS*|CYGWIN*)
            port_process=$(netstat -ano 2>/dev/null | grep ":$DEV_PORT " | grep LISTENING | awk '{print $5}' | head -1 || echo "")
            ;;
    esac
    
    if [[ -n "$port_process" ]]; then
        log_warning "⚠️  端口 ${COLOR_VALUE}${DEV_PORT}${COLOR_RESET} 已被占用"
        log_info "  → 进程 PID: ${COLOR_VALUE}${port_process}${COLOR_RESET}"
        
        echo ""
        read -p "$(echo -e "${COLOR_WARNING}[warning ]${COLOR_RESET} 是否终止占用进程？(y/n): ")" -r confirm
        echo ""
        
        if [[ "${confirm}" =~ ^[Yy]$ ]]; then
            case "$(uname -s)" in
                Linux|Darwin)
                    kill -9 "$port_process" 2>/dev/null || true
                    ;;
                MINGW*|MSYS*|CYGWIN*)
                    taskkill /F /PID "$port_process" 2>/dev/null || true
                    ;;
            esac
            log_success "✅ 端口 ${DEV_PORT} 已清理"
        else
            log_warning "⊘  跳过端口清理，开发服务器可能启动失败"
        fi
    else
        log_success "✅ 端口 ${DEV_PORT} 可用"
    fi
    
    echo ""
}

#==============================================
# 依赖安装
#==============================================

install_dependencies() {
    log_info "📥 Step 4/6: 检查并安装依赖..."
    
    local node_modules_exists=false
    if [[ -d "node_modules" ]]; then
        node_modules_exists=true
        log_info "  → node_modules 已存在"
        
        local pkg_count
        case "$(uname -s)" in
            Linux|Darwin)
                pkg_count=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
                ;;
            MINGW*|MSYS*|CYGWIN*)
                pkg_count=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
                ;;
        esac
        
        log_info "  → 已安装包数量: ${COLOR_VALUE}${pkg_count}${COLOR_RESET}"
    fi
    
    local package_json_modified=false
    if [[ -f "package.json" ]]; then
        if [[ "$node_modules_exists" == true ]]; then
            case "$(uname -s)" in
                Linux|Darwin)
                    if [[ "package.json" -nt "node_modules" ]]; then
                        package_json_modified=true
                    fi
                    ;;
                *)
                    package_json_modified=false
                    ;;
            esac
        fi
    else
        log_error "❌ package.json 不存在"
        exit 1
    fi
    
    if [[ "$node_modules_exists" == false ]] || [[ "$package_json_modified" == true ]]; then
        log_info "  → 执行 npm install..."
        
        npm install 2>&1 | while IFS= read -r line; do
            if [[ "$line" =~ ^(added|removed|changed|audited) ]]; then
                echo -e "${COLOR_DIMMED}    ${line}${COLOR_RESET}"
            fi
        done
        
        log_success "✅ 依赖安装完成"
    else
        log_info "  → 依赖已安装，跳过 npm install"
        log_notice "  → 如需强制更新，请删除 node_modules 后重新运行"
    fi
    
    echo ""
}

#==============================================
# 代码检查
#==============================================

run_checks() {
    log_info "🔬 Step 5/6: 代码质量检查..."
    
    local typecheck_failed=false
    local lint_failed=false
    
    log_info "  → 执行 TypeScript 类型检查..."
    if npm run typecheck 2>&1 | while IFS= read -r line; do
        if [[ "$line" =~ (error|Error) ]]; then
            echo -e "${COLOR_ERROR}    ${line}${COLOR_RESET}"
        elif [[ "$line" =~ ^src/ ]]; then
            echo -e "${COLOR_DIMMED}    ${line}${COLOR_RESET}"
        fi
    done; then
        typecheck_failed=false
    else
        typecheck_failed=true
    fi
    
    if [[ "$typecheck_failed" == true ]]; then
        log_warning "⚠️  类型检查发现问题"
    else
        log_success "  → TypeScript 类型检查通过"
    fi
    
    log_info "  → 执行 ESLint 代码检查..."
    if npm run lint 2>&1 | while IFS= read -r line; do
        if [[ "$line" =~ (error|warning) ]] && [[ "$line" =~ ^[0-9]+ ]]; then
            echo -e "${COLOR_WARNING}    ${line}${COLOR_RESET}"
        elif [[ "$line" =~ ^src/ ]]; then
            echo -e "${COLOR_DIMMED}    ${line}${COLOR_RESET}"
        fi
    done; then
        lint_failed=false
    else
        lint_failed=true
    fi
    
    if [[ "$lint_failed" == true ]]; then
        log_warning "⚠️  ESLint 检查发现问题"
    else
        log_success "  → ESLint 代码检查通过"
    fi
    
    if [[ "$typecheck_failed" == true ]] || [[ "$lint_failed" == true ]]; then
        echo ""
        read -p "$(echo -e "${COLOR_WARNING}[warning ]${COLOR_RESET} 检查发现问题，是否继续启动？(y/n): ")" -r confirm
        echo ""
        
        if [[ ! "${confirm}" =~ ^[Yy]$ ]]; then
            log_error "❌ 用户取消启动"
            exit 1
        fi
        log_notice "→ 继续启动开发服务器..."
    fi
    
    echo ""
}

#==============================================
# 启动开发服务器
#==============================================

start_dev_server() {
    log_info "🚀 Step 6/6: 启动开发服务器..."
    
    log_success "✅ 启动 Vite 开发服务器"
    echo ""
    print_separator
    echo ""
    echo -e "${COLOR_KEY}  🌐 Local:   ${COLOR_VALUE}http://localhost:${DEV_PORT}${COLOR_RESET}"
    echo -e "${COLOR_KEY}  🌐 Network: ${COLOR_VALUE}http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo '0.0.0.0'):${DEV_PORT}${COLOR_RESET}"
    echo ""
    print_separator
    echo ""
    log_notice " 按 Ctrl+C 停止服务器"
    echo ""
    
    npm run dev
}

#==============================================
# 主函数
#==============================================

main() {
    clear
    print_header
    
    detect_system
    print_separator
    
    check_node_version
    print_separator
    
    clean_port
    print_separator
    
    install_dependencies
    print_separator
    
    run_checks
    print_separator
    
    start_dev_server
}

#==============================================
# 错误处理
#==============================================

trap 'log_error "❌ 启动脚本执行失败，退出码: $?"' ERR

#==============================================
# 执行主函数
#==============================================

main "$@"