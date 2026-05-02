# Lost and Found Web Application

A full-stack Lost and Found web application built for a college placement-level project.

Users can:

- Create an account
- Login
- Post lost or found items
- Search and filter items
- Contact the person who posted an item
- Manage their own posts
- Mark items as resolved

## Tech Stack

- Backend: Node.js, Express.js
- Database: SQLite SQL database
- Authentication: JWT and bcryptjs
- Frontend: HTML, CSS, JavaScript

## Features

- User signup and login
- Password hashing
- JWT authentication
- Post lost/found items
- Search items
- Filter by lost/found status
- Filter by category
- View contact details
- Delete own posts
- Mark posts as active/resolved

## Folder Structure

```text
lost-and-found/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      server.js
    .env.example
    package.json

  frontend/
    index.html
    css/
      style.css
    js/
      app.js
