"use strict";

function API() { }

API.URL_BASE = 'https://filebin.glitch.me/'
API.API_BASE = API.URL_BASE + 'api/'

API.prototype.getFiles = function () {
  return fetch(API.API_BASE + 'files').then(res => res.json())
}

API.prototype.deleteFile = function (filename) {
  return fetch(API.API_BASE + 'file/' + filename, {
    method: 'DELETE',
    mode: 'cors',
    redirect: 'follow'
  }).then(res => res.json())
}

function DateTimeUtils() { }

DateTimeUtils.prototype.getRelativeTime = function (timestamp) {
  const yearInSeconds = 31536000;
  const monthInSeconds = 2592000;
  const dayInSeconds = 86400;
  const hourInSeconds = 3600;
  const minuteInSeconds = 60;
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  let interval = Math.floor(seconds / yearInSeconds);
  if (interval >= 1) {
    return interval + ' years ago';
  }

  interval = Math.floor(seconds / monthInSeconds);
  if (interval >= 1) {
    return interval + ' months ago';
  }

  interval = Math.floor(seconds / dayInSeconds);
  if (interval >= 1) {
    return interval + ' days ago';
  }

  interval = Math.floor(seconds / hourInSeconds);
  if (interval >= 1) {
    return interval + ' hours ago';
  }

  interval = Math.floor(seconds / minuteInSeconds);
  if (interval >= 1) {
    return interval + ' minutes ago';
  }

  return Math.floor(seconds) + ' seconds ago';
}

DateTimeUtils.prototype.formatDate = function (timestamp) {
  const date = new Date(timestamp);
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + date.getMonth()).slice(-2);
  const year = ('0' + date.getFullYear()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}

function Display() { }

Display.prototype.insertRow = function (row) {
  const dt = new DateTimeUtils()
  const html = `
  <td>${row.originalName}</td>
  <td>${dt.formatDate(row.createdAt)} (${dt.getRelativeTime(row.createdAt)})</td>
  <td>
    <a href="${API.URL_BASE}/file/${row.filename}" class="action" target="_blank">
      <img src="assets/img/view.svg" height="24px" class="mr-2">
    </a> | 
      <img src="assets/img/delete.svg" height="20px" class="ml-2 action" data-filename="${row.filename}" data-delfile>
  </td>
  `
  const element = document.createElement('tr')
  element.innerHTML = html
  document.querySelector('#files-table tbody').appendChild(element)
}

Display.prototype.updateFilesTable = function () {
  const api = new API()
  api.getFiles().then(data => {
    document.querySelector('#files-table tbody').innerHTML = ''
    data.forEach(row => {
      this.insertRow(row)
    })
    this.addDeleteFileListeners()
  })
}

Display.prototype.addDeleteFileListeners = function () {
  document.querySelectorAll('[data-delfile]').forEach(row => {
    row.addEventListener('click', e => {
      const filename = e.target.dataset.filename
      const api = new API()

      api.deleteFile(filename).then(data => {
        if (data.success) {
          this.updateFilesTable()
        }
      })
    })
  })
}

window.addEventListener('DOMContentLoaded', () => {
  const display = new Display()

  display.updateFilesTable()

  const dz = document.getElementById('dz-upload').dropzone
  dz.on('success', (e) => {
    display.updateFilesTable()
  })
})
