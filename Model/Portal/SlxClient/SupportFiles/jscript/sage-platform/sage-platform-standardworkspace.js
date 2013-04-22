
function toggleSmartPartVisiblity(contentID, img){
    var content = document.getElementById(contentID);
    if(content.style.display =="none"){
        content.style.display = "block";
    }
    else{
        content.style.display = "none";
    }
    if(img.src == imgCollapse.src){
        img.src = imgExpand.src;
    }
    else{
        img.src = imgCollapse.src;
    }
}
