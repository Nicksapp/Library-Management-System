# Library-Management-System

> @Xidian University-Software engineering major <br>
> Software Process and Project Management's team Big Project -> Library-Management-System



## Technology stack

- Node.js/Express
- MongoDB/Mongolass
- Semantic-UI
- jQuery

## Build

> install MongoDB first

```shell
git clone https://github.com/Nicksapp/Library-Management-System.git

cd Library-Management-System & npm install & mkdir data/db

// go to MongoDB document and find ./bin then

./mongod dbpath @Library-Management-System/data/db // connect mongodb first

node index.js
```



## Release 

### Release 1
* As an administrator I Want to login
* As an  administrator I Want to manage the information of books
* As an Reader I Want to search books 
* As an Reader I Want to register
* As an Reader I Want to login
* As an Reader I Want to logout
* As an administrator I Want to logout
* As an administrator I Want to add book
* As an administrator I Want to delete book

### Release 2
* As an Reader I Want to borrow applying
* As an Reader I Want to return the book
* As an Reader I Want to cancel reservation
* As an Reader I Want to renew books
* As an Reader I Want to search my applying/reserving/borrowed books

### Release 3
* As an administrator I Want to search all the applying/reserving/borrowed books
* As an administrator I Want to confirm borrow
* As an administrator I Want to return books
* As an administrator I Want to quick borrow
* As an administrator I Want to quick return