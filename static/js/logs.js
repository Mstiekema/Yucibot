function changeDate() {
    var x = document.getElementById("myDate");
    var date = x.value;
    var url = location.href.split("/")
    window.location.href = "/user/" + url[4] + "/logs/" + date;
}

function changeDateAdmin() {
    var x = document.getElementById("myDate");
    var date = x.value;
    var url = location.href.split("/")
    if (url[5]) {
      window.location.href = "/admin/logs/" + url[5] + "/" + date
    } else {
      window.location.href = "/admin/logs/" + date
    }
}

$("#searchBarLogs").keyup(function() {
  var input = document.getElementById("searchBarLogs");
  var filter = input.value.toLowerCase();
  var log = document.getElementsByClassName("logs");
  for (var x = 0; x < log.length; x++) {
    if (log[x].innerHTML.toLowerCase().indexOf(filter) > -1) {
      log[x].style.display = "";
    } else {
      log[x].style.display = "none";
    }
  }
})
