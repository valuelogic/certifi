# Certifi

Blockchain Republic app

## Quickstart

install packages (core and front)

```bash
make install
```

create `./front/.env` file with following attributes and replace `MORALIS_API_KEY_PLACEHOLDER` with API key from your moralis account
```
APP_DOMAIN=vl.certifi
MORALIS_API_KEY=MORALIS_API_KEY_PLACEHOLDER
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=e1422215c9234cad0d435bd41a0f29cd
```

## front:

 - run dev server:

```bash
make f_dev
```

 - run ESLint:

```bash
make f_dev
```

## core:

 - run dev node:

```bash
make c_dev
```
