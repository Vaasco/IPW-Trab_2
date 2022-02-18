# Borga Games

## Project Structure

![Project Dependencies](https://user-images.githubusercontent.com/64478921/154697642-2599b7e5-2ba6-4868-85e5-ddf523b48999.svg)

### borga-db:
- Access to application data (users, tokens, groups, games etc), stored in an Elastic Search database.

### borga-games-data:
- Access to the Board Games Atlas API.

### borga-services:
- Implementation of the logic of each of the application's functionalities.

### borga-web-api:
- Implementation of the HTTP routes that make up the REST API of the web application.

### borga-web-site:
- Implementation of the web site using express on server side.

### client:

- Implementation of the PUT and DELETE methods on the client side.

### borga-launch:
- Launches the server application. Entry point.

### borga-server:
- Dependency manager.

Data Storage

Elastic Search Indices:<br>
- prod_gamecollection<br>
    > Each document represents a game identified by its id from Board Game Atlas.
    ```javascript
        {
            "_id": "GAME_ID",
            "_source": {
                "id" : "GAME_ID",
                "url" : "",
                "name" : "",
                "price" : "",
                "min_players" : 0,
                "max_players" : 0,
                "min_age": 0,
                "description" : "",
                "image_url" : "",
                "rules_url" : "",
                "amazon_rank" : 0,
                "official_url" : "",
                "borga_rank" : 0,
                "mechanics" : [
                    {
                    "id" : "", // Relation with prod_mechanics documents' id
                    "url" : ""
                    }
                ],
                "categories" : [
                    {
                    "id" : "", // Relation with prod_categories documents' id
                    "url" : ""
                    }
                ]    
            }
        }
    ```

- prod_tokens<br>
   > Each document represents an user identified by its token.
    ```javascript
    {
        "_id": "USER_TOKEN",
        "_source": {
            "username": "", // Relation with prod_{username} this property names the index
            "password": ""
        }
    }
    ```

- prod_{username}<br>
    > Each document represents a group identified by its id.
    ```javascript
    {
        "_id": "GROUP_ID",
        "_source": {
            "name": "",
            "description": "",
            "games": [
                "GAME1_ID", // Relation with prod_gamecollection documents' id
                "GAME2_ID"
            ]
        }
    }
    ```

- prod_categories<br>
    > Each document represents a category identified by its id.
    ```javascript
    {
        "_id": "CATEGORY_ID",
        "_source": {
           "infoObj": {
                "id": "",
                "name": "", 
                "url": ""
            }
        }   
    }
    ```

- prod_mechanics<br>
    > Each document represents a mechanic identified by its id.
    ```javascript
    {
        "_id": "MECHANIC_ID",
        "_source": {
           "infoObj": {
                "id": "",
                "name": "", 
                "url": ""
            }
        }   
    }
    ```

The main object schemas that flow through the application are specified in the api reference below.

## Api Reference

>https://isel-ipw-2122-1-g13d2.herokuapp.com/api/docs/
>
>**Or locally**: http://localhost:8888/api/docs/

## App Execution

### App Configuration

The file that holds the app configs is `borga-config.js`

You can configure:
- **devl_es_url**: Your elastic search database url
- **guest**: A user that is created on server start with username password and token at choice
- **MODE**: <i>LOCAL</i> if there isn't a remote database, <i>REMOTE</i> if there is a remote connection to an elastic search database

### Step-by-step

1. First of all navigate to the project's root package (where `package.json` is) 
2. Run `npm install` to install all the necessary dependencies.
3. Create a `.env` file with the variable **ATLAS_CLIENT_ID** with your <i>Board Game Atlas</i> API KEY.
> ATLAS_CLIENT_ID=YOUR_API_KEY
4. Run your <i>Elastic Search</i> database
    - It's possible to run without it by navigating to `borga-config.js` and change the DB_MODE property to LOCAL (the other option is REMOTE)
5. To run the app: `npm start`.

To run the tests: `npm test`.

Heroku deployed app: https://isel-ipw-2122-1-g13d2.herokuapp.com/