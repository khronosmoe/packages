# Surgio Gateway

This is a modified version of gateway with support for TLS.
By default gateway listens on `http` port `3000`. 
TLS is turned on *only* when there is a file `tls.yaml`. 

```bash
npm init surgio-store surgio
cd surgio
npm i @khronosmoe/gateway
npm i @surgio/gateway-frontend
```

Edit `tls.yaml`
```bash
tls_server_config:
  cert_file: server.crt
  key_file: server.key
```

Edit `gateway.js`
```js
const gateway = require('@khronosmoe/gateway')

;(async () => {
   const app = await gateway.bootstrap()
})()
```

Default https port is `3001`.
