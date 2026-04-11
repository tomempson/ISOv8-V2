# Error Code Reference

Error codes displayed on the `/error/` page when a form submission fails.

## General

| Code | HTTP | Cause |
|------|------|-------|
| E-001 | 405 | Non-POST request to the submit function |
| E-002 | 429 | Rate limit exceeded (5 submissions per IP per 15 minutes) |
| E-003 | 422 | Form submitted less than 3 seconds after page load (bot detection) |

## Validation (E-1xx)

Returned when server-side field validation fails. The first digit identifies the field.

| Code | HTTP | Cause |
|------|------|-------|
| E-100 | 422 | Name is empty |
| E-101 | 422 | Name exceeds 80 characters |
| E-110 | 422 | Telephone is empty |
| E-111 | 422 | Telephone fails pattern (must be 7-15 digits) |
| E-120 | 422 | Business name is empty |
| E-121 | 422 | Business name exceeds 100 characters |
| E-130 | 422 | Enquiry details are empty |
| E-131 | 422 | Enquiry details exceeds 1000 characters |

## Delivery (E-5xx)

Returned by the Netlify Function when forwarding to Netlify Forms fails.

| Code | HTTP | Cause |
|------|------|-------|
| E-500 | 502 | Netlify Forms returned a non-OK response |
| E-501 | 502 | Network error when forwarding to Netlify Forms |
| E-502 | — | Function returned non-OK but response body could not be parsed (set client-side) |

## Client (E-6xx)

Set by the browser script. Never returned by the function.

| Code | HTTP | Cause |
|------|------|-------|
| E-600 | — | Browser could not reach the function at all (offline / DNS / timeout) |
