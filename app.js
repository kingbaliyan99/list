//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-king:Test123@cluster0-irwvv.mongodb.net/todolistDB",{useUnifiedTopology: true,useNewUrlParser: true}); // above code is to create and connect our mongo database.

const itemsSchema =new mongoose.Schema({ // created schema itemsSchema
  name:String
});

const Item= mongoose.model("Item",itemsSchema); // created model Item with collection name items

const read = new Item({ // value of item 1
  name:"Click on the check box to delete item"
});
const eat = new Item({ // value of item 2
  name:"Type in New items to make a list"
});
const bath = new Item({ // value of item 2
  name:"Click on + to add list."
});

const defaultItems = [read,eat,bath];

const listSchema ={  // created 2nd schema
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema); // created model for 2nd schema

//------------------------------------------------------------------------------------------//

app.get("/", function(req, res) {

  Item.find(function(err,foundItems){ // no conditional curly braces as all needs to be found.

if(foundItems.length === 0){
  Item.insertMany(defaultItems,function(err){ // inserted values
    if(err){
      console.log(err);
    }else{
      console.log("Successfully inserted")
    }
  });
  res.redirect("/");
} else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  });

});

//---------------------------------------------------------------------------//

app.get("/:customListName",function(req,res){

  const customListName = req.params.customListName;

List.findOne({name: customListName},function(err,foundList){
  if(!err){

    if(!foundList){

      // create a new list
      const list = new List({  // created  new list document
        name: customListName,
        items: defaultItems // used defaultItems array to unsert value in items
      });

      list.save();
      res.redirect("/" + customListName);

    }else
        { // show the existing list
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});

});

//------------------------------------------------------------------------------//

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const buttonItem = new Item({ // create new item
    name:itemName
  });

  if(listName ==="Today"){
    buttonItem.save(); // save to our database
    res.redirect("/");
  }
else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(buttonItem);
    foundList.save();
    res.redirect("/" + listName);
  });
}
});

//------------------------------------------------------------------------------------------//

app.post("/delete",function(req,res){
const checkedItem =  req.body.checkbox;
const listName = req.body.listName;

if(listName==="Today"){
  Item.findByIdAndRemove(checkedItem,function(err){
    if(err){
      console.log(err)
    }else{
      console.log("Successfully deleted checked Item")
      res.redirect("/");
    }
  });
}
else{
  List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItem}}}, function(err,foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}


});

//======================================================================================//

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port==null || port ==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully");
});
