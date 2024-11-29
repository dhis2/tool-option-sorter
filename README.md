# OptionSet sort order fixer
Tool to fix the sort order of optionSets. The sort order can become corrupted in some instance, for example with gaps in the sort order index. This app will keep the current overall order, but fix these gaps which can be problematic in 40 and below in particular. I.e. if the sort order is `1, 2, 3, 5, 6, 7, 9`, updating it using this tool will set the sort order to `1, 2, 3, 4, 5, 6, 7`, maintaining the order of the options.

> **WARNING**
> This tool is intended to be used by system administrators to perform specific tasks, it is not intended for end users. It is available as a DHIS2 app, but has not been through the same rigorous testing as normal core apps. It should be used with care, and always tested in a development environment.


## License
© Copyright University of Oslo 2024

## Getting started

### Install dependencies
To install app dependencies:

```
yarn install
```

### Compile to zip
To compile the app to a .zip file that can be installed in DHIS2:

```
yarn run zip
```

### Start dev server
To start the webpack development server:

```
yarn start
```

By default, webpack will start on port 8081, and assumes DHIS2 is running on 
http://localhost:8080/dhis with `admin:district` as the user and password.

A different DHIS2 instance can be used to develop against by adding a `d2auth.json` file like this:

```
{
    "baseUrl": "localhost:9000/dev",
    "username": "john_doe",
    "password": "District1!"
}
```
