# Dynamessage Backend

## Overview

Dynamessage's RESTful API with NodeJS

## Installation & Local Run

1. `npm install`
2. `npx nodemon`

## Usage

### Environment Variables

Please refer to the `.env.example` file

```
NODE_ENV =

APP_URL =
APP_PORT =
APP_KEY =
URL =

DB_NAME =
DB_USER =
DB_PASS =
DB_HOST =
DIALECT =

SMTP_SERVICE =
SMTP_HOST =
SMTP_USER =
SMTP_PASSWORD =
```

### Response

```json
{
  "status"  : "200, 400, 401, 404, 500"
  "success" : true or false,
  "message" : "Success or failed",
  "results" : [{ "results" }]
}
```
