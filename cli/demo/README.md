# demo

demo

## Runtime
javascript

## Getting Started

1. Build your function:
   ```bash
   monad-faas build
   ```

2. Register on-chain:
   ```bash
   monad-faas register
   ```

3. Check status:
   ```bash
   monad-faas status
   ```

## Configuration

Edit `monad-faas.config.json` to configure:
- RPC URL
- Registry contract address
- Private key
- IPFS settings

## Function Structure

Your function should export a `main` function that accepts a context object:

```javascript
function main(context) {
  // context.trigger - trigger data
  // context.env - environment variables
  
  return {
    success: true,
    data: "your result"
  };
}
```

## Triggers

Configure triggers in `package.json` under `monadFaas.triggers`.

## Monad FaaS CLI

- `monad-faas init` - Initialize new project
- `monad-faas build` - Build to WASM
- `monad-faas register` - Register on-chain
- `monad-faas upload` - Upload to IPFS
- `monad-faas status` - Check function status
