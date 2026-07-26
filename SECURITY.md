# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in Auto WP Publisher, please **do not
open a public issue**. Instead, report it privately so it can be addressed
before disclosure:

- Use GitHub's [private vulnerability reporting](https://github.com/trhgatu/auto-wp-publisher/security/advisories/new), or
- Email the maintainer at **trananhtu1112003@gmail.com** with the details.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce or a proof of concept
- Affected version, component (backend / frontend / infra) and environment

You can expect an initial acknowledgement within a few business days. We ask
that you give us a reasonable amount of time to release a fix before any public
disclosure.

## Supported versions

This project is under active development; security fixes are applied to the
`main` branch. Please always run the latest released version.

## Handling secrets

- Never commit `.env` files, API keys, database credentials or JWT secrets.
- Rotate any credential that may have been exposed.
- `JWT_SECRET` must be a long, random value (see `.env.example`).
