const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://anshumant72:%40Anshu2580@cluster0.djhgttk.mongodb.net/?retryWrites=true&w=majority")


const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to our ToDo List"
});
const item2 = new Item({
  name: "Click on + button to add new item"
});
const item3 = new Item({
  name: "<-- hit this to delete the button"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
  Item.find({},(err,foundItems)=>{
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems,function(err){
        if (err) {
          console.log(err)
        }
        else{
          console.log("Successfully Inserted the element");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle :"Today", newListItem : foundItems});
    }
  })

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList) {
    if(!err){
      if (!foundList) {
        const list = new List({
          name: customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListName);        
      }
      else{
        res.render("list",{listTitle : foundList.name, newListItem : foundList.items}); 
      }
    }
  })

});

app.post("/",function(req,res){

  const itemName = req.body.add;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");    
  }
  else{
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});
app.post("/delete",function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(!err){
        console.log("Successfully deleted the item");
        res.redirect("/");
      }
    });    
  }
  else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err){
      if(!err){
        res.redirect("/"+ listName);
      }
     })
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server has started successfully");
});
