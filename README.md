CSC 337 final project
Project name: Recipe Sharing Platform

This is a Node.js web application built using Express. Follow the steps below to install dependencies and run the project.

1. Install required packages:
    npm install express
    npm install mongodb
2. Start the server:
    node server.js

The application will run at http://localhost:8080

Note: If code files are not separated into subfolders, organize them in the following way with subfolders (middleware, routes, views). This is also described in report.pdf section titled "File Structure".

/middleware/
	requireLogin.js
/routes/
	favorites.js
	recipes.js
	users.js
/views/
	index.html
	login.html
	my_cookbook.html
    recipe_edit_form.html
	recipe_form.html
	recipe_form.html
	recipes.html
	register.html
	style.css
server.js
README.md
.gitignore
package-lock.json
package.json

