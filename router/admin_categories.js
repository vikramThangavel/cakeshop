var express=require('express');
var router=express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isUser;

var Category=require("../models/category");

router.get("/",isAdmin,function(req,res){
  Category.find(function(err,categories){
      if(err) return console.log(err);
      res.render("admin/categories",{
          categories:categories
      });
  });
});


router.get("/add-category",isAdmin,function(req,res){
    var title="";

    res.render("admin/add_category",{
        title:title
    });
});

router.post("/add-category",function(req,res){
      req.checkBody('title','title must have a value').notEmpty();

      var title=req.body.title;
      slug=title.replace(/\s+/g,'-').toLowerCase();

      var errors=req.validationErrors();
      if(errors){
        res.render("admin/add_category",{
            errors:errors,
            title:title
        });
      }else{
        Category.findOne({slug: slug}, function (err, category) {
            if (err) {
                req.flash('danger', 'Category slug exists, choose another.');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                });

                category.save(function (err) {
                    if (err)
                        return console.log(err);

                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });

                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });
            }
        });
    }

});

// router.post("/reorder-pages",function(req,res){
//     var ids = req.body['id[]'];

//     var count=0;

//     for(var i=0;i<ids.length;i++){
//         var id=ids[i];
//         count++;


//         (function(count){
//         Page.findById(id,function(err,page){
//             page.sorting =count;
//             page.save(function(err){
//                 if(err)
//                     return console.log(err);
                
//             });
//          });
//       })(count);
//     }
// });

/*
 * GET edit page
 */
router.get('/edit-category/:id', isAdmin, function (req, res) {

    Category.findById(req.params.id, function (err, category) {
        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});

router.post("/edit-category/:id",function(req,res){
    req.checkBody('title','title must have a value').notEmpty();

    var title=req.body.title;
    slug=title.replace(/\s+/g,'-').toLowerCase();
    var id=req.params.id;

    var errors=req.validationErrors();
    if(errors){
      res.render("admin/edit_category",{
          errors:errors,
          title:title,
          id:id
      });
    }else{
      Category.findOne({slug: slug,_id:{'$ne':id}}, function (err, category) {
          if (category) {
              req.flash('danger', 'category title exists, choose another.');
              res.render('admin/edit_category', {
                  title: title,
                  id:id
              });
          } else {
            Category.findById(id,function(err,category){
                if(err) return console.log(err);

                category.title=title;
                category.slug=slug;
            
                category.save(function (err) {
                    if (err)
                        return console.log(err);

                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });
  
                    req.flash('success', 'category edited!');
                    res.redirect('/admin/categories/edit-category/'+id);
                }); 
            
            });
              
          }
      });
  }

});
 
router.get("/delete-category/:id",isAdmin,function(req,res){
   Category.findByIdAndRemove(req.params.id,function(err){
       if(err)
         return console.log(err);

         Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });

         req.flash('success', 'category deleted!');
         res.redirect('/admin/categories/');
   });
});


  module.exports=router;