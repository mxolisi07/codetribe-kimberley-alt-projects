Topic: NodeTS <br />
Submission Date: 30 October 2026 <br />
Time: 09:00 AM


Please submit by pushing to your GitHub repository and creating a pull request to your mentor

# Title: Task 6 - Shopping List API

## Project Overview
You are tasked to build a shopping list REST API that lets users manage the items they want to buy. The app allows users to add, view, update, and delete items from the shopping list.

## Use-case Scenario

 - Suppose you need to make a note of groceries before going to the store.
 - You make a shopping list consisting of items such as "Milk, Eggs, Bread.".
 - As you shop, you can check off items that you've purchased.
 - You can modify amounts (e.g., 2L of milk rather than 1).
 - You can remove items you do not need anymore.

The application should run as a NodeJS HTTP server with Typescript. Users must be able to interact with the application using API requests, e.g Postman.

## Core Features
 - Add an item
   - Endpoint: POST /items
 - Get All items
   - Endpoint: GET /items
 - Get a Single item by ID
   - Endpoint: GET /items/:id
 - Update an item (name, quantity, purchased status, etc…)
   - Endpoint: PUT /items/:id
 - Delete an item
   - Endpoint: DELETE /items/:id

## Task Breakdown

### Sprint 1: Project Setup
   - Setup Node.js + TypeScript project (tsconfig.json, package.json)
   - Create a basic HTTP server (server.ts)

### Sprint 2: Shopping List Items CRUD
   - Create Item type in models/item.ts.
   - Store items in memory (array of objects).
   - Implement GET /items → return all items.
   - Implement POST /items → create a new item.
   - Return validation errors if fields are missing.

### Sprint 3: Item Details & Updates
   - Implement GET /items/:id → return item by ID.
   - Implement PUT /items/:id → update name, quantity, or purchased status.
   - Return 404 if item not found.
   - Add validation.

### Sprint 4: Delete Items
   - Implement DELETE /items/:id.
   - Return 204 No Content if deleted, 404 if not found.

### Sprint 5: Error Handling & Response Consistency
   - Create a reusable error handler (400 for bad input, 404 for not found).
   - Ensure all responses are JSON with a consistent shape.

### Sprint 6: Testing & Documentation
   - Test endpoints with Postman.
   - Document API endpoints in a README.md.

### Deliverables
   1. Readme file
   2. Project
