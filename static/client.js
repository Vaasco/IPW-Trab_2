'use strict'

function setupGroupDelete(){
    const deleteButtons = document.querySelectorAll('.delete-groups')
    deleteButtons.forEach(butDel => {butDel.onclick = onDeleteGroup})
    return 

    async function onDeleteGroup(e){
        e.preventDefault()
        console.log(this)
        const id = this.id.replace("btn-group-", "")
        try{
            await apiDeleteGroup(id)
            deleteListItem(id)
        }catch(err){
            alert(err)
        }
    }

    async function apiDeleteGroup(groupID){
        try {
            const deleteReq = await fetch(
                '/api/my/groups/' + groupID,
                {
                    method: 'DELETE',
                    headers: {
                        Authentication: "bearer <token>"
                    }
                }
            )
            if(deleteReq.status === 200){
                return
            }
        } catch (error) {
            throw new Error(
                'Failed to delete the group with id ' + groupID + '\n' +
                deleteReq.status + ' ' + deleteReq.statusText 
            )
        }
    }

    function deleteListItem(groupID) {
		const listEntryId = '#item-' + groupID;
		const listEntry = document.querySelector(listEntryId);
		listEntry.parentNode.removeChild(listEntry);
	}

}

function setupGameDelete(groupID){
    const deleteButtons = document.querySelectorAll('.delete-games')
    deleteButtons.forEach(butDel => {butDel.onclick = onDeleteGame})
    return

    async function onDeleteGame(e){
        e.preventDefault()
        const id = this.id.replace("btn-game-", "")
        try{
            await apiDeleteGame(id)
            deleteListItem(id)
        }catch(err){
            alert(err)
        }

    }

    async function apiDeleteGame(gameID){
        try {
            const deleteReq = await fetch(
                '/api/my/groups/' + groupID + '/' + gameID,
                {method: 'DELETE'}
            )
            if(deleteReq.status === 200){
                return
            }
        } catch (error) {
            throw new Error(
                'Failed to delete the game with id ' + gameID + '\n' +
                deleteReq.status + ' ' + deleteReq.statusText 
            )
        }
    }

    function deleteListItem(gameID) {
		const listEntryId = '#game-' + gameID;
		const listEntry = document.querySelector(listEntryId);
		listEntry.parentNode.removeChild(listEntry);
	}

}

function setupGroupEdit(groupID){

    const editButton = document.querySelector(`#edit-${groupID}`)
    editButton.onclick = (e) => {
        e.preventDefault()
        const nameInput = document.querySelector("#group-name")
        const descriptionInput = document.querySelector("#group-description")
        onEditGroup(nameInput.value, descriptionInput.value)
    }
    
    async function onEditGroup(newName, newDescription){

        const apiEditGroup = async function (groupID){
            
            const body = {newGroupName: newName, newGroupDescription: newDescription}
            const editReq = await fetch(
                '/api/my/groups/' + groupID,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body, null, 4)
                }
            )
            console.log(editReq)
            if(editReq.status === 200){
                return
            }
            throw new Error(
                'Failed to edit group with id ' + groupID + '\n' +
                editReq.status + ' ' + editReq.statusText 
            )
        }

        try{
            await apiEditGroup(groupID)
            location.assign("/groups")
        }catch(err){
            console.log(err)
            alert(err)
        }
    }

}