## Overview
The project is a Twitter like social media platform allowing user to share images and text-based posts. Additionally, the platform incorporates a social networking aspect enabling users to follow other users whose posts they wish to see in their feed.

## Technical Implementation
The project utilizes Javascript, CSS and HTML for responsive and interactive web page while empowering Django as backend, PostgreSQL as database and Redis for caching data.
The API implementaion follows RESTful API principles.

## Dependencies
- Django v4.2.11
- Python v3.10
- PostgreSQL v16

### Python Libraries
- PILLOW v10.2.0
- dateutil v2.9.0
- Django Debug Toolbar

## Installation
1. Clone the repository: `git clone https://github.com/daniel9032/Twitter-clone`
2. Install dependencies

## Usage
1. Go to the main directory
2. Start the server by running: `python manage.py runserver`
3. On first time starting, running `python manage.py makemigrations network` `python manage.py migrate network` `python manage.py migrate` to apply all migrations
4. Open your web browser and navigate to `http://127.0.0.1:8000`
