/* ==========================================================================
   SkillPath - content & sample data
   Everything the website "knows" lives here: careers,
   learning modules, and demo students. script.js reads this file only through
   the global SKILLPATH_DATA object, so you can edit content without touching
   any application logic.
   ========================================================================== */
(function (root) {
  'use strict';

  /* ---------- Resource helpers ---------- */
  const R = {
    fcc: { title: 'freeCodeCamp - free curriculum', url: 'https://www.freecodecamp.org/learn' },
    mdn: { title: 'MDN Learn Web Development', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
    jsinfo: { title: 'javascript.info - The Modern JavaScript Tutorial', url: 'https://javascript.info' },
    cs50: { title: 'Harvard CS50 (free)', url: 'https://cs50.harvard.edu/x' },
    cs50p: { title: 'Harvard CS50P - Python (free)', url: 'https://cs50.harvard.edu/python' },
    pytut: { title: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/' },
    gitbook: { title: 'Pro Git book (free)', url: 'https://git-scm.com/book/en/v2' },
    ghskills: { title: 'GitHub Skills - interactive courses', url: 'https://skills.github.com' },
    sqlbolt: { title: 'SQLBolt - interactive SQL lessons', url: 'https://sqlbolt.com' },
    kaggle: { title: 'Kaggle Learn (free micro-courses)', url: 'https://www.kaggle.com/learn' },
    neetcode: { title: 'NeetCode roadmap', url: 'https://neetcode.io/roadmap' },
    gfg: { title: 'GeeksforGeeks tutorials', url: 'https://www.geeksforgeeks.org' },
    visualgo: { title: 'VisuAlgo - algorithm animations', url: 'https://visualgo.net' },
    react: { title: 'React official docs (react.dev/learn)', url: 'https://react.dev/learn' },
    node: { title: 'Node.js - Learn', url: 'https://nodejs.org/en/learn' },
    express: { title: 'Express.js - Getting started', url: 'https://expressjs.com/en/starter/installing.html' },
    mongo: { title: 'MongoDB University (free courses)', url: 'https://learn.mongodb.com' },
    devjava: { title: 'dev.java - Learn Java', url: 'https://dev.java/learn/' },
    spring: { title: 'Spring Guides', url: 'https://spring.io/guides' },
    flask: { title: 'Flask Tutorial', url: 'https://flask.palletsprojects.com/en/stable/tutorial/' },
    django: { title: 'Django - Write your first app', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/' },
    atbs: { title: 'Automate the Boring Stuff with Python (free online)', url: 'https://automatetheboringstuff.com' },
    sklearn: { title: 'scikit-learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html' },
    pandas: { title: 'pandas - 10 minutes to pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html' },
    numpy: { title: 'NumPy - Learn', url: 'https://numpy.org/learn/' },
    nn3b1b: { title: '3Blue1Brown - Neural Networks', url: 'https://www.3blue1brown.com/topics/neural-networks' },
    khanla: { title: 'Khan Academy - Linear Algebra', url: 'https://www.khanacademy.org/math/linear-algebra' },
    froggy: { title: 'Flexbox Froggy (game)', url: 'https://flexboxfroggy.com' },
    grid: { title: 'CSS Grid Garden (game)', url: 'https://cssgridgarden.com' },
    webdev: { title: 'web.dev Learn', url: 'https://web.dev/learn' },
    roadmap: { title: 'roadmap.sh - developer roadmaps', url: 'https://roadmap.sh' },
    owasp: { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
    mlcc: { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
    fastai: { title: 'fast.ai Practical Deep Learning', url: 'https://course.fast.ai' },
    pages: { title: 'GitHub Pages documentation', url: 'https://pages.github.com' },
    leetcode: { title: 'LeetCode (free problems)', url: 'https://leetcode.com/problemset/' },
    hackerrank: { title: 'HackerRank practice', url: 'https://www.hackerrank.com/domains' },
    exercism: { title: 'Exercism - free coding practice', url: 'https://exercism.org' },
    baeldung: { title: 'Baeldung - Java & Spring tutorials', url: 'https://www.baeldung.com' },
    realpyoop: { title: 'Real Python - OOP in Python', url: 'https://realpython.com/python3-object-oriented-programming/' },
    odin: { title: 'The Odin Project (free)', url: 'https://www.theodinproject.com' },
    w3: { title: 'W3Schools tutorials', url: 'https://www.w3schools.com' },
    streamlit: { title: 'Streamlit documentation', url: 'https://docs.streamlit.io' },
    cppref: { title: 'learncpp.com (free)', url: 'https://www.learncpp.com' },
    cbook: { title: 'Beej\'s Guide to C (free)', url: 'https://beej.us/guide/bgc/' }
  };

  /* Language-specific resources for the "Programming basics" module. */
  const LANGUAGE_RESOURCES = {
    Python: [R.cs50p, R.pytut, R.exercism],
    Java: [R.devjava, R.cs50, R.exercism],
    JavaScript: [R.jsinfo, R.fcc, R.exercism],
    'C++': [R.cppref, R.cs50, R.exercism],
    C: [R.cbook, R.cs50, R.exercism]
  };

  /* ---------- Learning modules ----------
     hours -> realistic study hours for a beginner at normal pace.
     The roadmap engine (script.js) shortens or keeps modules based on the student's level. */
  const MODULES = {
    'prog-basics': {
      title: 'Programming basics in {lang}', hours: 24,
      why: 'Every career path starts here. You learn how programs store data (variables), make decisions (if/else), repeat work (loops) and organise code (functions).',
      tasks: [
        'Write programs that use variables, input and output in {lang}',
        'Solve 10 beginner problems on conditions and loops (FizzBuzz, prime check, reverse a number)',
        'Write 5 small functions and test each with different inputs',
        'Build a command-line project: a number-guessing game or a simple calculator'
      ],
      langResources: true
    },
    'git-basics': {
      title: 'Git & GitHub essentials', hours: 8,
      why: 'Git records the history of your code and GitHub hosts it online. Recruiters look at your GitHub profile, so you want a habit of committing from day one.',
      tasks: [
        'Install Git and make your first repository with git init, add and commit',
        'Create a GitHub account and push a repository to it',
        'Practise branching: create a branch, make a change, merge it back',
        'Write a clear README.md for one of your projects'
      ],
      resources: [R.gitbook, R.ghskills]
    },
    'dsa-arrays': {
      title: 'DSA 1: Arrays, strings & hashing', hours: 30,
      why: 'Arrays, strings and hash maps appear in most interview questions. You learn to measure efficiency with Big-O and to pick the right structure.',
      tasks: [
        'Learn Big-O notation and explain the complexity of 5 simple loops',
        'Solve 10 array problems (two sum, max subarray, rotate array)',
        'Solve 8 string problems (palindrome, anagram, longest substring)',
        'Use a hash map/dictionary to solve 5 counting or lookup problems'
      ],
      resources: [R.neetcode, R.visualgo, R.gfg]
    },
    'dsa-stack-trees': {
      title: 'DSA 2: Linked lists, stacks, queues & trees', hours: 30,
      why: 'These structures model real systems: undo history (stack), print queues (queue), folders and menus (trees).',
      tasks: [
        'Implement a linked list, a stack and a queue from scratch',
        'Solve 6 stack/queue problems (valid parentheses, next greater element)',
        'Learn binary trees: write inorder, preorder and level-order traversals',
        'Solve 6 binary tree and binary search tree problems'
      ],
      resources: [R.neetcode, R.visualgo, R.gfg]
    },
    'dsa-sorting-recursion': {
      title: 'DSA 3: Sorting, searching & recursion', hours: 24,
      why: 'Sorting and binary search are interview staples, and recursion is the key to trees, graphs and dynamic programming.',
      tasks: [
        'Implement bubble, merge and quick sort and compare their speeds',
        'Write binary search iteratively and recursively',
        'Solve 8 recursion problems (factorial, subsets, permutations)',
        'Attempt 3 beginner dynamic programming problems (Fibonacci, climbing stairs, coin change)'
      ],
      resources: [R.neetcode, R.visualgo, R.leetcode]
    },
    'html-css-basics': {
      title: 'HTML5 & CSS3 fundamentals', hours: 24,
      why: 'HTML gives a web page its structure and CSS gives it style. This is the visible layer of every website.',
      tasks: [
        'Build a personal profile page using semantic tags (header, nav, main, section, footer)',
        'Create a styled form with labels, inputs and a submit button',
        'Style a page with colours, fonts, spacing (box model) and hover effects',
        'Recreate a simple landing page from a screenshot'
      ],
      resources: [R.mdn, R.fcc, R.w3]
    },
    'css-layout': {
      title: 'Responsive layouts: Flexbox, Grid & media queries', hours: 20,
      why: 'Over half of web traffic is on phones, so layouts must adapt to every screen size. Flexbox and Grid are the modern tools for this.',
      tasks: [
        'Finish all levels of Flexbox Froggy and CSS Grid Garden',
        'Build a responsive navigation bar with a mobile menu',
        'Create a card grid that goes from 1 to 2 to 3 columns using media queries',
        'Make a full responsive portfolio page and test it at 360px, 768px and 1280px'
      ],
      resources: [R.froggy, R.grid, R.webdev]
    },
    'js-core': {
      title: 'JavaScript fundamentals', hours: 30,
      why: 'JavaScript makes pages interactive and also runs servers via Node.js. You learn variables, functions, arrays, objects and modern ES6+ syntax.',
      tasks: [
        'Practise let/const, data types, operators and template strings in the browser console',
        'Write functions and use array methods (map, filter, reduce) on 10 small exercises',
        'Work with objects, destructuring and JSON',
        'Build a tip calculator or quiz game using only JavaScript logic'
      ],
      resources: [R.jsinfo, R.mdn, R.fcc]
    },
    'js-dom': {
      title: 'The DOM & browser events', hours: 20,
      why: 'The DOM is how JavaScript reads and changes the page. Clicking, typing and form submission all use events.',
      tasks: [
        'Select elements and change text, classes and styles with JavaScript',
        'Add click and input event listeners; validate a form with helpful messages',
        'Build a to-do app that stores its data in LocalStorage',
        'Create an image slider or tabs component without any library'
      ],
      resources: [R.jsinfo, R.mdn, R.odin]
    },
    'js-async-api': {
      title: 'Async JavaScript & working with APIs', hours: 18,
      why: 'Real apps load data from servers. Promises and async/await let your page keep working while it waits for a response.',
      tasks: [
        'Explain callbacks, Promises and async/await in your own words',
        'Fetch data from a free public API and render it as cards',
        'Handle loading and error states properly (try/catch)',
        'Build a weather or movie-search app using a free API'
      ],
      resources: [R.jsinfo, R.mdn, R.fcc]
    },
    'react-basics': {
      title: 'React fundamentals', hours: 36,
      why: 'React is the most requested front-end library. It lets you build the interface from small reusable components that update when data changes.',
      tasks: [
        'Create a React app and build 3 components with props',
        'Manage data with useState and side-effects with useEffect',
        'Build a multi-page app with React Router',
        'Rebuild your to-do app in React and deploy it'
      ],
      resources: [R.react, R.fcc, R.odin]
    },
    'frontend-quality': {
      title: 'Accessibility, performance & testing basics', hours: 12,
      why: 'Professional front-end work is fast, usable by everyone and tested. These habits set your portfolio apart.',
      tasks: [
        'Run a Lighthouse audit on one of your projects and fix 3 issues',
        'Add alt text, labels and keyboard focus styles; check colour contrast',
        'Compress images and lazy-load them',
        'Write a short checklist you apply before every deployment'
      ],
      resources: [R.webdev, R.mdn]
    },
    'node-express': {
      title: 'Node.js & Express servers', hours: 28,
      why: 'Node lets you run JavaScript on a server. Express adds routing, so you can build the back end of a web app in the same language you use in the browser.',
      tasks: [
        'Set up a Node project with npm and run a simple HTTP server',
        'Build an Express app with GET, POST, PUT and DELETE routes',
        'Add middleware for logging, JSON parsing and error handling',
        'Use environment variables and keep secrets out of Git'
      ],
      resources: [R.node, R.express, R.fcc]
    },
    'rest-api': {
      title: 'REST API design', hours: 16,
      why: 'APIs are how front ends, mobile apps and other services talk to your server. Good design makes them predictable and easy to use.',
      tasks: [
        'Learn HTTP methods, status codes and JSON request/response formats',
        'Design the endpoints for a blog (posts, comments, users) on paper first',
        'Test every endpoint with Postman, Thunder Client or curl',
        'Add input validation and return meaningful error messages'
      ],
      resources: [R.mdn, R.roadmap]
    },
    'auth-security': {
      title: 'Authentication & security basics', hours: 16,
      why: 'Almost every app has users. You need to store passwords safely and protect routes without leaking data.',
      tasks: [
        'Hash passwords with bcrypt (or the equivalent in your language)',
        'Implement register and login with sessions or JWT tokens',
        'Protect a route so only logged-in users can reach it',
        'Read the OWASP Top 10 and note how to prevent injection and broken auth'
      ],
      resources: [R.owasp, R.mdn]
    },
    'sql-basics': {
      title: 'SQL & relational database basics', hours: 20,
      why: 'Most business data lives in relational databases. SQL is the language for storing, finding and combining it.',
      tasks: [
        'Complete the SQLBolt lessons on SELECT, WHERE and ORDER BY',
        'Create tables with primary and foreign keys, and insert sample data',
        'Practise INNER and LEFT JOINs across 3 tables',
        'Use GROUP BY with COUNT, SUM and AVG on a sample dataset'
      ],
      resources: [R.sqlbolt, R.kaggle, R.fcc]
    },
    'sql-advanced': {
      title: 'Database design & intermediate SQL', hours: 18,
      why: 'Good schema design avoids duplicated data and slow queries. Interviewers often ask about normalisation and indexes.',
      tasks: [
        'Normalise a messy table up to third normal form (3NF)',
        'Write subqueries and use HAVING with GROUP BY',
        'Add an index and explain why a query becomes faster',
        'Explain ACID transactions and try BEGIN/COMMIT/ROLLBACK'
      ],
      resources: [R.sqlbolt, R.gfg]
    },
    mongodb: {
      title: 'MongoDB & NoSQL basics', hours: 14,
      why: 'NoSQL databases store flexible JSON-like documents and are popular with JavaScript back ends.',
      tasks: [
        'Install MongoDB (or use a free Atlas cluster) and insert documents',
        'Query, update and delete documents with filters',
        'Connect Express to MongoDB using Mongoose',
        'List 3 situations where you would choose SQL and 3 for NoSQL'
      ],
      resources: [R.mongo, R.fcc]
    },
    'deploy-basics': {
      title: 'Deploying your projects online', hours: 8,
      why: 'A project that only runs on your laptop cannot be seen by a recruiter. Free hosting lets you share a live link.',
      tasks: [
        'Publish a static site with GitHub Pages, Netlify or Vercel',
        'Deploy a small back-end API on a free hosting tier',
        'Add the live links to your project READMEs',
        'Learn what environment variables and build commands do'
      ],
      resources: [R.pages, R.roadmap]
    },
    'python-core': {
      title: 'Python in depth: data structures, files & modules', hours: 24,
      why: 'Python is loved for its readable syntax. Here you move past the basics: lists, dictionaries, comprehensions, file handling and error handling.',
      tasks: [
        'Master lists, tuples, sets and dictionaries with 15 exercises',
        'Write list/dict comprehensions and generator expressions',
        'Read and write text, CSV and JSON files',
        'Handle errors with try/except and split code into modules'
      ],
      resources: [R.cs50p, R.pytut, R.exercism]
    },
    'python-oop': {
      title: 'Object-oriented programming in Python', hours: 18,
      why: 'OOP organises code into classes and objects. Interviews and real frameworks both rely on it.',
      tasks: [
        'Create classes with attributes, methods and __init__',
        'Practise inheritance, polymorphism and encapsulation with a small example (Shapes, Bank accounts)',
        'Use dunder methods like __str__ and __repr__',
        'Build an OOP project such as a library management system'
      ],
      resources: [R.realpyoop, R.pytut]
    },
    'flask-django': {
      title: 'Python web development with Flask or Django', hours: 32,
      why: 'Frameworks handle routing, templates and database access so you can focus on features. Start with Flask (small) then look at Django (batteries included).',
      tasks: [
        'Complete the official Flask tutorial and build a blog',
        'Create templates with Jinja2 and handle HTML forms',
        'Connect to SQLite using SQLAlchemy or the Django ORM',
        'Skim the Django tutorial and note how it differs from Flask'
      ],
      resources: [R.flask, R.django]
    },
    'python-automation': {
      title: 'Python automation & scripting', hours: 14,
      why: 'Python shines at automating repetitive work. These small scripts make excellent portfolio items.',
      tasks: [
        'Write a script that renames or sorts files in a folder',
        'Scrape a public web page politely with requests and BeautifulSoup',
        'Send yourself an automated email or generate a PDF/Excel report',
        'Schedule a script to run automatically on your computer'
      ],
      resources: [R.atbs, R.pytut]
    },
    'java-oop-collections': {
      title: 'Java OOP & the Collections Framework', hours: 32,
      why: 'Java is strongly object-oriented. Classes, interfaces and collections (List, Map, Set) are asked in nearly every Java interview.',
      tasks: [
        'Write classes with constructors, getters/setters and static members',
        'Practise inheritance, abstract classes, interfaces and polymorphism',
        'Use ArrayList, HashMap and HashSet; compare their behaviour',
        'Handle exceptions and read/write files; try streams and lambdas'
      ],
      resources: [R.devjava, R.baeldung]
    },
    'java-spring': {
      title: 'JDBC, Spring Boot & REST in Java', hours: 40,
      why: 'Spring Boot is the most widely used Java framework for back-end services in industry.',
      tasks: [
        'Connect Java to a database with JDBC and run CRUD queries',
        'Create a Spring Boot project and build a REST controller',
        'Use Spring Data JPA to map classes to tables',
        'Build a complete Student or Employee management REST API'
      ],
      resources: [R.spring, R.baeldung, R.devjava]
    },
    'java-concurrency': {
      title: 'Java multithreading & core internals', hours: 16,
      why: 'Interviewers like to ask about threads, memory and the JVM. Knowing the basics shows depth.',
      tasks: [
        'Create threads with Thread and Runnable; explain race conditions',
        'Use synchronized blocks and an ExecutorService',
        'Explain the JVM, JRE, JDK, garbage collection and the String pool',
        'Compare HashMap and ConcurrentHashMap'
      ],
      resources: [R.devjava, R.baeldung]
    },
    'math-for-ml': {
      title: 'Maths for machine learning', hours: 22,
      why: 'ML models are built on vectors, matrices, probability and gradients. You only need the intuition at first, not advanced proofs.',
      tasks: [
        'Understand vectors, matrices and dot products with small numeric examples',
        'Learn mean, variance, standard deviation and basic probability',
        'Watch the 3Blue1Brown neural network series to see gradients visually',
        'Compute a simple gradient descent step by hand for y = x^2'
      ],
      resources: [R.khanla, R.nn3b1b, R.kaggle]
    },
    'numpy-pandas': {
      title: 'Data handling with NumPy, pandas & charts', hours: 24,
      why: '80% of ML work is preparing data. pandas and NumPy are the everyday tools for this.',
      tasks: [
        'Create and slice NumPy arrays; do vectorised maths',
        'Load a CSV with pandas; clean missing values and duplicates',
        'Group, filter and merge DataFrames',
        'Plot 4 charts with matplotlib and write down what each shows'
      ],
      resources: [R.pandas, R.numpy, R.kaggle]
    },
    'ml-basics': {
      title: 'Machine learning fundamentals', hours: 36,
      why: 'You learn how models learn from data: regression, classification, trees and clustering with scikit-learn.',
      tasks: [
        'Explain supervised vs unsupervised learning with an example of each',
        'Train a linear regression model and a decision tree on a sample dataset',
        'Split data into training and test sets and measure accuracy',
        'Complete the Kaggle "Intro to Machine Learning" course'
      ],
      resources: [R.mlcc, R.sklearn, R.kaggle]
    },
    'ml-eval': {
      title: 'Model evaluation & feature engineering', hours: 20,
      why: 'A model is only useful if you can measure it honestly. Overfitting and data leakage are the most common beginner mistakes.',
      tasks: [
        'Calculate precision, recall, F1 and a confusion matrix for a classifier',
        'Use cross-validation and explain overfitting vs underfitting',
        'Engineer 3 new features for a dataset and check their effect',
        'Compare 3 models on the same dataset and justify your choice'
      ],
      resources: [R.mlcc, R.sklearn, R.kaggle]
    },
    'deep-learning': {
      title: 'Introduction to deep learning', hours: 30,
      why: 'Neural networks power image, text and speech models. You will train a small one end to end.',
      tasks: [
        'Explain neurons, layers, activation functions and backpropagation in plain words',
        'Train a neural network on MNIST digits with Keras or PyTorch',
        'Try a pre-trained model for image or text classification',
        'Take the first lessons of fast.ai Practical Deep Learning'
      ],
      resources: [R.fastai, R.nn3b1b, R.kaggle]
    },
    'ml-deploy': {
      title: 'Showing your ML work: apps & notebooks', hours: 10,
      why: 'A trained model nobody can use is hard to showcase. A simple web app or a clear notebook makes your work visible.',
      tasks: [
        'Save a trained model to disk and load it again',
        'Build a small Streamlit app that takes input and shows a prediction',
        'Write a clean Jupyter/Kaggle notebook with explanations',
        'Publish the code and a short write-up on GitHub'
      ],
      resources: [R.streamlit, R.kaggle]
    }
  };

  /* ---------- Careers ---------- */
  const CAREERS = {
    frontend: {
      id: 'frontend', name: 'Frontend Developer', icon: '🎨',
      tagline: 'Build everything users see and touch.',
      description: 'Frontend developers turn designs into fast, accessible, interactive websites and web apps using HTML, CSS and JavaScript frameworks.',
      skills: ['HTML5', 'CSS3', 'Responsive design', 'JavaScript', 'React', 'Git', 'Accessibility', 'APIs'],
      forceLang: null,
      foundations: ['prog-basics', 'git-basics', 'html-css-basics', 'css-layout'],
      core: ['js-core', 'js-dom', 'dsa-arrays', 'js-async-api', 'react-basics', 'frontend-quality', 'deploy-basics'],
      projects: [
        { title: 'Personal portfolio website', desc: 'Responsive multi-section portfolio with a contact form, deployed on GitHub Pages.', level: 'beginner' },
        { title: 'Weather dashboard', desc: 'Search any city and show forecasts from a free API with loading and error states.', level: 'beginner' },
        { title: 'Task manager with LocalStorage', desc: 'Add, edit, filter and persist tasks; build a second version in React.', level: 'intermediate' },
        { title: 'E-commerce product page in React', desc: 'Product grid, filters, cart and checkout form with validation.', level: 'advanced' }
      ],
      interview: [
        { group: 'HTML & CSS', items: ['Box model and box-sizing', 'Flexbox vs Grid: when to use which', 'Specificity and the cascade', 'Semantic HTML and accessibility'] },
        { group: 'JavaScript', items: ['var vs let vs const, hoisting and scope', 'Closures and the this keyword', 'Event loop, Promises and async/await', 'Event delegation and DOM manipulation'] },
        { group: 'React', items: ['Props vs state', 'Hooks: useState and useEffect', 'Keys in lists and virtual DOM', 'Controlled vs uncontrolled components'] }
      ]
    },
    backend: {
      id: 'backend', name: 'Backend Developer', icon: '⚙️',
      tagline: 'Power the logic, data and APIs behind apps.',
      description: 'Backend developers build the servers, databases and APIs that store data, enforce rules and serve front-end apps securely.',
      skills: ['JavaScript / Node.js', 'Express', 'REST APIs', 'SQL', 'MongoDB', 'Authentication', 'Git', 'Deployment'],
      forceLang: null,
      foundations: ['prog-basics', 'git-basics', 'sql-basics', 'js-core'],
      core: ['dsa-arrays', 'node-express', 'rest-api', 'sql-advanced', 'auth-security', 'mongodb', 'dsa-stack-trees', 'deploy-basics'],
      projects: [
        { title: 'Notes REST API', desc: 'CRUD API with Express and a database, tested with Postman.', level: 'beginner' },
        { title: 'URL shortener', desc: 'Create short links, redirect them and count the clicks.', level: 'beginner' },
        { title: 'Blog platform API with authentication', desc: 'Users, posts and comments with login, hashed passwords and protected routes.', level: 'intermediate' },
        { title: 'Expense tracker with reports', desc: 'Relational schema, aggregation queries and a monthly summary endpoint.', level: 'advanced' }
      ],
      interview: [
        { group: 'Server & APIs', items: ['REST principles and HTTP status codes', 'Middleware and request lifecycle', 'Authentication vs authorisation; JWT vs sessions', 'Rate limiting and input validation'] },
        { group: 'Databases', items: ['SQL joins, indexes and normalisation', 'ACID and transactions', 'SQL vs NoSQL trade-offs', 'N+1 query problem'] },
        { group: 'Fundamentals', items: ['Synchronous vs asynchronous code', 'Caching basics', 'Environment variables and secrets', 'Common security issues (OWASP Top 10)'] }
      ]
    },
    fullstack: {
      id: 'fullstack', name: 'Full-Stack Developer', icon: '🧩',
      tagline: 'Own the product from interface to database.',
      description: 'Full-stack developers work on both the user interface and the server, so they can ship a complete feature on their own.',
      skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js & Express', 'SQL / MongoDB', 'REST APIs', 'Authentication', 'Git & deployment'],
      forceLang: null,
      foundations: ['prog-basics', 'git-basics', 'html-css-basics', 'css-layout'],
      core: ['js-core', 'js-dom', 'dsa-arrays', 'js-async-api', 'react-basics', 'node-express', 'sql-basics', 'rest-api', 'auth-security', 'deploy-basics'],
      projects: [
        { title: 'Personal portfolio with contact backend', desc: 'Static front end plus a small API that stores contact messages.', level: 'beginner' },
        { title: 'Todo app with user accounts', desc: 'React front end, Express API, database and login.', level: 'intermediate' },
        { title: 'Blog / CMS platform', desc: 'Create, edit and publish posts with image upload and role-based access.', level: 'intermediate' },
        { title: 'Mini e-commerce site', desc: 'Product catalogue, cart, orders and an admin panel, deployed live.', level: 'advanced' }
      ],
      interview: [
        { group: 'Front end', items: ['Closures, scope and the event loop', 'React state and props, hooks', 'Responsive design approaches', 'Browser storage: cookies vs LocalStorage'] },
        { group: 'Back end', items: ['REST API design', 'Authentication flow end to end', 'SQL joins and indexing', 'Error handling and validation'] },
        { group: 'Whole product', items: ['What happens when you type a URL and press Enter', 'CORS and why it exists', 'How you would deploy and monitor an app', 'Walk through your biggest project end to end'] }
      ]
    },
    python: {
      id: 'python', name: 'Python Developer', icon: '🐍',
      tagline: 'Write clean, powerful code for the web and automation.',
      description: 'Python developers build web back ends, automation scripts and tools using one of the most readable and versatile languages.',
      skills: ['Python', 'OOP', 'Flask / Django', 'SQL', 'Automation', 'Data structures', 'Git', 'Testing basics'],
      forceLang: 'Python',
      foundations: ['prog-basics', 'git-basics', 'python-core'],
      core: ['python-oop', 'dsa-arrays', 'sql-basics', 'dsa-stack-trees', 'flask-django', 'rest-api', 'python-automation', 'dsa-sorting-recursion'],
      projects: [
        { title: 'Expense tracker (command line)', desc: 'Store expenses in a CSV file and show monthly totals.', level: 'beginner' },
        { title: 'File organiser script', desc: 'Automatically sort a messy downloads folder by file type.', level: 'beginner' },
        { title: 'Flask blog with SQLite', desc: 'Register, log in, write and delete posts.', level: 'intermediate' },
        { title: 'Public API data dashboard', desc: 'Fetch, clean and display live data in a Flask or Django app.', level: 'advanced' }
      ],
      interview: [
        { group: 'Python language', items: ['List vs tuple vs set vs dict', 'Mutable vs immutable types', 'Decorators and generators', 'Shallow vs deep copy', '*args and **kwargs'] },
        { group: 'OOP & design', items: ['Classes, inheritance and polymorphism', 'Dunder methods', 'Exception handling', 'Virtual environments and pip'] },
        { group: 'Web & data', items: ['Flask vs Django', 'SQL joins and ORMs', 'Writing a REST endpoint', 'Basic unit testing with pytest'] }
      ]
    },
    java: {
      id: 'java', name: 'Java Developer', icon: '☕',
      tagline: 'Build reliable, large-scale applications.',
      description: 'Java developers build enterprise back ends, banking and e-commerce systems and Android foundations using a strongly typed, object-oriented language.',
      skills: ['Core Java', 'OOP', 'Collections', 'JDBC & SQL', 'Spring Boot', 'REST APIs', 'Multithreading', 'Git'],
      forceLang: 'Java',
      foundations: ['prog-basics', 'git-basics', 'java-oop-collections'],
      core: ['dsa-arrays', 'sql-basics', 'dsa-stack-trees', 'java-concurrency', 'java-spring', 'rest-api', 'dsa-sorting-recursion', 'sql-advanced'],
      projects: [
        { title: 'Library management system (console)', desc: 'OOP design with classes, interfaces and collections.', level: 'beginner' },
        { title: 'Student records with JDBC', desc: 'CRUD operations against a database from Java.', level: 'beginner' },
        { title: 'Employee REST API with Spring Boot', desc: 'Controllers, services and repositories using Spring Data JPA.', level: 'intermediate' },
        { title: 'Online bookstore back end', desc: 'Users, cart, orders, validation and exception handling.', level: 'advanced' }
      ],
      interview: [
        { group: 'Core Java', items: ['JDK vs JRE vs JVM', 'String immutability and the string pool', 'equals() and hashCode()', 'Checked vs unchecked exceptions'] },
        { group: 'OOP & collections', items: ['Abstract class vs interface', 'ArrayList vs LinkedList; HashMap internals', 'Overloading vs overriding', 'Java 8 streams and lambdas'] },
        { group: 'Framework & DB', items: ['Spring Boot basics and dependency injection', 'REST controller design', 'JDBC vs JPA', 'Threads, synchronisation and deadlock'] }
      ]
    },
    aiml: {
      id: 'aiml', name: 'AI/ML Engineer', icon: '🤖',
      tagline: 'Teach computers to learn from data.',
      description: 'AI/ML engineers prepare data, train and evaluate machine-learning models and present the results in usable applications.',
      skills: ['Python', 'Maths & statistics', 'NumPy & pandas', 'scikit-learn', 'Model evaluation', 'Deep learning basics', 'SQL', 'Git'],
      forceLang: 'Python',
      foundations: ['prog-basics', 'git-basics', 'python-core', 'math-for-ml'],
      core: ['numpy-pandas', 'dsa-arrays', 'sql-basics', 'ml-basics', 'ml-eval', 'deep-learning', 'ml-deploy'],
      projects: [
        { title: 'Data exploration report', desc: 'Clean a public dataset, plot insights and write your findings.', level: 'beginner' },
        { title: 'House price predictor', desc: 'Regression model with feature engineering and honest evaluation.', level: 'beginner' },
        { title: 'Spam or sentiment classifier', desc: 'Classify text, show a confusion matrix and discuss errors.', level: 'intermediate' },
        { title: 'Image classifier web app', desc: 'Train or fine-tune a small CNN and serve it with Streamlit.', level: 'advanced' }
      ],
      interview: [
        { group: 'ML concepts', items: ['Supervised vs unsupervised learning', 'Bias-variance trade-off and overfitting', 'Train/validation/test split and cross-validation', 'Precision, recall, F1 and ROC-AUC'] },
        { group: 'Algorithms', items: ['Linear and logistic regression', 'Decision trees and random forests', 'k-means clustering', 'Gradient descent and neural networks'] },
        { group: 'Data & tools', items: ['Handling missing data and outliers', 'Feature scaling and encoding', 'pandas and NumPy operations', 'Explain one of your projects end to end'] }
      ]
    }
  };

  /* General interview-preparation steps shared by every career. */
  const GENERAL_INTERVIEW = {
    dsa: { title: 'Practise coding problems', tasks: ['Solve 3 problems a week and write down the pattern you used', 'Do 2 timed mock sessions of 45 minutes each', 'Explain your solution aloud while coding'], resources: [R.neetcode, R.leetcode, R.hackerrank] },
    hr: { title: 'HR & behavioural interview preparation', tasks: ['Prepare a 60-second "Tell me about yourself" answer', 'Write 3 STAR-format stories (challenge, teamwork, learning from failure)', 'Prepare questions to ask the interviewer', 'Practise with a friend and ask for feedback'], resources: [R.roadmap] },
    resume: { title: 'Resume, GitHub & LinkedIn polish', tasks: ['Create a one-page resume with projects, skills and education', 'Pin your best 3 projects on GitHub with good READMEs', 'Update LinkedIn: headline, About section and project links', 'Ask one mentor or senior to review your resume'], resources: [R.ghskills, R.roadmap] }
  };

  /* Practice hours per project, by level. */
  const PROJECT_HOURS = { beginner: 12, intermediate: 20, advanced: 30 };

  /* ---------- Demo students (clearly labelled demo data in the UI) ---------- */
  const SAMPLES = [
    {
      id: 'demo-frontend', label: 'Demo: Aarav - Frontend (beginner)',
      profile: { name: 'Aarav (demo)', degree: 'B.Tech / B.E.', year: '2nd Year', language: 'JavaScript', level: 'Beginner', hours: 2 },
      careerId: 'frontend'
    },
    {
      id: 'demo-backend', label: 'Demo: Meera - Backend (intermediate)',
      profile: { name: 'Meera (demo)', degree: 'BCA', year: '3rd Year', language: 'Java', level: 'Intermediate', hours: 3 },
      careerId: 'backend'
    },
    {
      id: 'demo-aiml', label: 'Demo: Kabir - AI/ML (advanced, 4 hrs/day)',
      profile: { name: 'Kabir (demo)', degree: 'B.Sc (CS/IT)', year: 'Final Year', language: 'Python', level: 'Advanced', hours: 4 },
      careerId: 'aiml'
    }
  ];

  root.SKILLPATH_DATA = {
    MODULES, CAREERS, GENERAL_INTERVIEW,
    LANGUAGE_RESOURCES, PROJECT_HOURS, SAMPLES,
    OPTIONS: {
      degrees: ['B.Tech / B.E.', 'BCA', 'B.Sc (CS/IT)', 'MCA', 'M.Tech / M.E.', 'M.Sc (CS/IT)', 'Diploma', 'Other'],
      years: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Graduated'],
      languages: ['Python', 'Java', 'JavaScript', 'C++', 'C'],
      levels: ['Beginner', 'Intermediate', 'Advanced']
    }
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = root.SKILLPATH_DATA; }
})(typeof window !== 'undefined' ? window : globalThis);
