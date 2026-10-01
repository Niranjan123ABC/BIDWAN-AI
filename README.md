# Bidyan AI

AI-powered chatbot application that lets users interact with a locally hosted Large Language Model (LLM).

## Features
- AI response generation using Ollama
- Chat session management using unique session IDs
- Conversation history stored in PostgreSQL
- REST APIs for chat communication
- Responsive UI built with Thymeleaf, HTML, CSS, and JavaScript

## Tech Stack
Java, Spring Boot, PostgreSQL, JPA/Hibernate, Thymeleaf, HTML, CSS, JavaScript, Ollama API, REST API

## How to Run
1. Install Java, Maven, PostgreSQL, and Ollama.
2. Pull the model: `ollama pull qwen2.5-coder`
3. Create a PostgreSQL database named `BidyanAI` (port 5433).
4. Open `src/main/resources/application.properties` and set your own PostgreSQL password.
5. Run the project: `mvn spring-boot:run`
6. Open `http://localhost:8089` in your browser.
