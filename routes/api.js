/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const bookSchema = new mongoose.Schema(
  {
    title: String,
    comments: [String]
  }, 
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true 
    }
  }
);
bookSchema.virtual('commentcount')
.get(function() { return this.comments.length });
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async (req, res) => {
      let books = await Book
        .find({})
        .exec();
      res.json(books.map(book => {
        return {
          _id: book._id, 
          title: book.title, 
          commentcount: book.commentcount
        };
      }));
    })
    
    .post(function (req, res){
      if(!req.body.title) {
        res.send('validation failed');
        return;
      }

      const book = new Book({
        title: req.body.title
      });

      book.save((error, data) => {
        if(error) console.log(error);
        
        res.json(data);
      });
    })
    
    .delete(function(req, res){
      Book.deleteMany(
        (error, data) => {
          if(error) {
            res.send('could not delete');

            return;
          }
          
          res.send('complete delete successful');
        }
      );
    });



  app.route('/api/books/:id')
    .get((req, res) => {
      Book.findById(req.params.id, (error, data) => {
        if(error) {
          res.send('no book exists');
          return;
        }

        res.json(data);
      });
    })
    
    .post(function(req, res){
      Book.findByIdAndUpdate(
        req.params.id, 
        {comments: req.body.comment},
        {new: true},
        (error, data) => {
          if(error) console.log(error);

          res.json(data);
        }
      );
    })
    
    .delete(function(req, res){
      Book.deleteOne(
        {_id: req.body._id},
        (error, data) => {
          if(error) {
            res.send('could not delete ' + req.body._id);

            return;
          }
          
          res.send('deleted ' + req.body._id);
        }
      );
    });
  
};
