'use strict'

const errors = require('./borga-errors.js');

const users = {groups: {}}

const gameCollection = {games: []}

async function createNewGroup(groupName, groupDescription){
    // Erro se o grupo já existir TODO #1
    users.groups[groupName] = {
                name: groupName, 
                description: groupDescription,
                gameNames: []
            }
    
    return users.groups
}

async function getGroups(){
    return users.groups
}

async function editGroup(groupName, givenName, newDescription){
    const desc = newDescription ? newDescription : users.groups[groupName].description 
    const newName = givenName ? givenName : groupName   
    users.groups[newName] = {
        name: newName,
        description: desc,
        gameNames: users.groups[groupName].gameNames
    }
    delete users.groups[groupName]
    return users.groups  
}

module.exports = {
    createNewGroup: createNewGroup,
    getGroups: getGroups,
    editGroup: editGroup
}