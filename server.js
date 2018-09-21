// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
//^cheerio takes the html from the request and let's you use jquery like syntax to access particular text inside of it.

// Initialize Express
var app = express();

var port = 3000;


// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of `ycombinator`
  request("https://theonion.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class

      $("h1").each(function(i, element) {
  // Save the text and href of each link enclosed in the current element
        var link = $(element).children().attr("href");
        var title = $(element).children().text();

      /*
        cheerio takes the html from the request and let's you use jQuery like syntax to access particular text inside of it
      */
      // if there were two links inside, there aren't but if there were, and you want the second link then you would do this
      // var title = $(element).children("a").eq(1).text();

      var link = $(element).children("a").attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link,
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
