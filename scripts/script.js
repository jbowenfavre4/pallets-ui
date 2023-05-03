$(document).ready(function() {
    populateDashboard()
    populateDropdowns()
    populateCategories()
    $('#itemAlert').hide()
    $('#itemSuccess').hide()
    $('#categoryAlert').hide()
    $('#categorySuccess').hide()
    $('#orderAlert').hide()
    $('#orderSuccess').hide()
    
    $('#submitNewItem').click(function() {
        $('#itemAlert').hide()
        $('#itemSuccess').hide()
        let validation = itemValidation()
        if (validation == '') {
            for (let i = 0; i < $('#itemQty').val(); i++) {
                newItem()
            }
            console.log('called newitem()')
            clearItemInputs()
            $('#itemSuccess').show()

        } else {
            $('#itemAlert').show()
            $('#itemAlert').html(
                `<p>${validation}</p>`
            )
        }
    })

    $('#addCategory').click(function() {
        $('#categoryAlert').hide()
        $('#categorySuccess').hide()
        let validation = categoryValidation()
        if (validation == false) {
            $('#categoryAlert').show()
        } else {
            $('#categorySuccess').show()
            newCategory()
            $('#newCategory').val('')

        }
    })

    $('#submitNewOrder').click(function() {
        $('#orderAlert').hide()
        $('#orderSuccess').hide()
        let validation = orderValidation()
        if (validation == '') {
            console.log('called newOrder()')
            newOrder()
            clearOrderInputs()
            $('#orderSuccess').show()
            
        } else {
            $('#orderAlert').show()
            $('#orderAlert').html(
                `<p>${validation}</p>`
            )
        }
    })

})

function clearOrderInputs() {
    $('#orderName').val('')
    $('#orderDate').val('')
    $('#orderPrice').val('')
}

function clearItemInputs() {
    $('#itemName').val('')
    $('#itemQty').val('')
    $('#retailPrice').val('')
}

function itemValidation() {
    let errorText = ''
    if ($('#itemName').val() == '') {
        errorText += 'Item name is required.\n'
    } 
    if ($('#itemQty').val() < 1) {
        errorText += 'Item quantity must be at least one.\n'
    } 
    if ($('#retailPrice').val() <= 0) {
        errorText += 'Item price must be greater than 0.'
    }
    return errorText
}

function orderValidation() {
    let errorText = ''
    if ($('#orderName').val() == '') {
        errorText += 'Order name is required.\n'
    }
    if ($('#orderDate').val() == '') {
        errorText += 'Order date is required.\n'
    }
    if ($('#orderPrice').val() <= 0) {
        errorText += 'Order price must be greater than 0.'
    }
    return errorText
}

const newItem = async () => {
    const request = await fetch(`https://palletsapi.onrender.com/items`, {
        
        method: "POST",
        Headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({
            "itemName": `${$('#itemName').val()}`,
            "itemDescription": `temporary`,
            "palletId": `${$('#palletNum').val()}`,
            "itemPrice": `${$('#retailPrice').val()}`,
            "sold": false,
            "category": `${$('#itemCategory').val()}`,
            "sellDate": null,
            "sellPrice": null,
            "platform": 'temporary'
        }),
        headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    const data = await request.json()
    console.log(data)
    return data
}

const newOrder = async () => {
    const request = await fetch(`https://palletsapi.onrender.com/pallets`, {
        method: "POST",
        headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "palletName": `${$('#orderName').val()}`,
            "purchaseDate": `${$('#orderDate').val()}`,
            "purchasePrice": `${Number($('#orderPrice').val())}`
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    const data = await request.json()
    console.log(data)
    return data
}

const activePallets = async () => {
    const request = await fetch('https://palletsapi.onrender.com/pallets')
    const data = await request.json()
    return data
}

const itemsInPallet = async (palletId) => {
    const request = await fetch(`https://palletsapi.onrender.com/items/pallet/${palletId}`)
    const data = await request.json()
    return data
}

const populateDashboard = async () => {
    let totalProfit = 0
    let $palletsContainer = $('#palletsContainer')
    let pallets = await activePallets()
    for (let pallet of pallets) {
        let items = await itemsInPallet(pallet.palletId)
        let palletProfit = Math.round((totalSoldItems(items) - Number(pallet.purchasePrice)) * 100) / 100
        $palletsContainer.append(
            `<div class="border row my-3 pallet-row" data-pid="${pallet.palletId}">
                <div class="col-3">${pallet.palletName}</div>
                <div class="col-2 d-flex justify-content-center">$${pallet.purchasePrice}</div>
                <div class="col-2 d-flex justify-content-center">${(pallet.purchaseDate)}</div>
                <div class="col-2 d-flex justify-content-center">${countSoldItems(items)}/${items.length} items sold</div>
                <div class="col-3 d-flex justify-content-center ${palletProfit > 0 ? 'profit-green': 'profit-red'}">$${palletProfit}
            </div>`
        )
        totalProfit += Math.round((totalSoldItems(items) - pallet.purchasePrice) * 100)/100
    }

    $('.pallet-row').hover(function() {
        $(this).css('background-color', 'lightblue')                                               
    },
    function() {
        $(this).css('background-color', 'white')
    })

    $('.pallet-row').click(function() {
        console.log(this)
        window.location.href = `pallet.html?${$(this).attr('data-pid')}`
    })

    $('#profitNumber').html(Math.round(totalProfit * 100) / 100)
    $('#profitSpan').css('color', ((totalProfit > 0) ? 'green' : 'red'))
}

const populateCategories = async () => {
    let categories = await getCategoriesDropdown()
    let $catList = $('#categoryList')
    for (let category of categories) {
        $catList.append(
            `<li>${category.categoryName}</li>`
        )
    }
}

const getPalletsDropdown = async () => {
    const request = await fetch('https://palletsapi.onrender.com/pallets/dropdown')
    const data = await request.json()
    return data
}

const populateDropdowns = async () => {
    let palletsInfo = await getPalletsDropdown()
    let categoriesInfo = await getCategoriesDropdown()
    let $catDD = $('#itemCategory')
    let $palletDD = $('#palletNum')
    for (let category of categoriesInfo) {
        $catDD.append(
            `<option value="${category.categoryId}">${category.categoryName}</option>`
        )
    }
    for (let pallet of palletsInfo) {
        $palletDD.append(
            `<option value="${pallet.palletId}">${pallet.palletName}</option>`
        )
    }
    }

const getCategoriesDropdown = async () => {
    const request = await fetch(`https://palletsapi.onrender.com/categories/dropdown`)
    const data = await request.json()
    return data
}


function countSoldItems(items) {
    let count = 0
    for (let item of items) {
        if (item.sold == true) {
            count ++
        }
    }
    return count
}

function totalSoldItems(items) {
    let total = 0
    for (let item of items) {
        if (item.sold == true) {
            total += Number(item.sellPrice)
        }
    }
    return total
}

const newCategory = async () => {
    const request = await fetch(`https://palletsapi.onrender.com/categories`, {
        
        method: "POST",
        Headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({
            "categoryName": `${$('#newCategory').val()}`
        }),
        headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    const data = await request.json()
    console.log(data)
    return data
}

function categoryValidation() {
    if ($('#newCategory').val() == '') {
        return false
    }
    return true
}


