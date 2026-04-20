# 常见问题解答 (FAQ)

## 证书申请

**Q: 支持哪些证书颁发机构？**
A: 默认Let's Encrypt，也支持ZeroSSL、Buypass。

**Q: 证书有效期多久？**
A: 90天，脚本会在到期前30天自动续期。

**Q: 申请频率有限制吗？**
A: Let's Encrypt限制每周每域名50个证书。

## 配置相关

**Q: 如何配置多个域名？**
A: 在配置文件中用逗号分隔：`DOMAIN="example.com,www.example.com"`

**Q: 支持泛域名证书吗？**
A: 支持，需使用DNS API模式配置。

## 使用问题

**Q: Dry-run模式是什么？**
A: 测试模式，不实际申请证书：`DRY_RUN=true ./renew-ssl-cert.sh`

**Q: 如何查看日志？**
A: 启用日志：`ENABLE_LOG=true`，日志位于 `${BASE_DIR}/logs/`