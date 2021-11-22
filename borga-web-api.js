
'use strict'

const express = require('express');

module.exports = function (services){


    function getMostPopularGames(req, res){
        res.json({response: "GET MOST POPULAR IDS", query:req.query})
    }

    function getGameByName(req, res){
        
    }

    function getMyGroups(req, res){
        
    }

    function addGameByName(req, res){
        
    }

    function editGroup(req, res){
        
    }
    
    

    function deleteGroupByName(req, res){

    }
    
    function getGroupDetails(req,res){
        
    }

    function deleteGameByName(req, res){
        
    }
    
    const router = express.Router()

    router.use(express.json());

    router.get("/global/popular", getMostPopularGames)
    router.get("/global/:gameName", getGameByName)
    

    // Resource /my/groups
    router.get("/my/groups", getMyGroups)
    router.post("/my/groups", addGameByName)
    router.post("/my/groups", editGroup)

    // Resource /my/groups/<groupName>
    router.get("/my/groups/:groupName", getGroupDetails)
    router.delete("/my/groups/:groupName", deleteGroupByName)

    // Resource /my/groups/<groupName>/<gameName>
    router.delete("/my/groups/:groupName/:gameName", deleteGameByName)

    return router
}