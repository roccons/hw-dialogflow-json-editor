<template>
    <div>
        <div class="title">
            <input type="text" v-model="path" class="form-control" placeholder="/path/dir/" @keypress.enter="loadFiles">
            <!-- this input is a helper to select a path (not for select a file) -->
            <input type="file" name="files" class="form-control-file"> 
        </div>
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>
        <ul v-if="files.length > 0">
            <li v-for="(_fileName, index) in files" 
                :key="index"
                @click="openFile(_fileName)"
                :class="{active: _fileName == current && loaded}">
                {{ _fileName }}
            </li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios'
import config from '../../config/app.js'

export default {
    data () {
        return {
            path: '',
            files: [],
            file: '',
            loaded: false,
            opened: false,
            current: '',
            next: '',
            error: ''
        }
    },

    mounted () {
        this.path = localStorage.getItem('path')
        this.loadFiles()
    },

    methods: {

        // get the list of files from the api server
        loadFiles () {
            this.files = []
            this.error = ''
            localStorage.setItem('path', this.path)
            axios.get(config.server + '/files', {
                params: {
                    path: this.path
                }
            })
              .then(res => {
                  this.files = res.data.files
              })
              .catch(err => {
                  this.error = err.response ? err.response.data.message : err
              })
        },

        // get the contents of the file selected
        loadFile (fileName) {
            this.current = fileName
            axios.get(config.server + '/file', {
                params: {
                    file: this.path + '/' + fileName
                }
            })
            .then (res => {
                this.file = JSON.parse(res.data.file) // file content
                this.$emit('loadFile', fileName, this.file)
                this.loaded = true
                this.opened = true
            })
            .catch(err => {
                  this.error = err.response ? err.response.data.message : err
                  this.loaded = false
            })
        },

        // open a file. If any is opened, it shows a confirm modal
        openFile (fileName) {
            this.next = fileName
            if (this.next !== this.current) {
                this.loadFile(fileName)
            }
        },

    }
}
</script>

<style lang="scss" scoped>

.title {
    background: var(--gray);
    color: white;
    padding: 0.25em 0.5em;
    span {
        font-style: italic;
    }
}
ul {
    padding: 0;
    li {
        color: white;
        padding: 0.1em 0 0.1em 1em;
        border-top: 1px solid rgba(#000, 0.1);
        cursor: pointer;
        &:hover {
            background: var(--gray);
        }
        &.active {
            background: var(--blue);
        }
    }
}

</style>

