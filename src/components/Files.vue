<template>
    <div>
        <div class="path d-flex justify-content-between align-items-center">
            <span :title="path">{{ path }}</span>
            <div>
                <button class="btn btn-sm mr-1" title="Open directory" data-toggle="modal" data-target="#open-dir-modal">📁</button>
                <button class="btn btn-sm" title="Search in all files" data-toggle="modal" data-target="#search-modal">🔎</button>
            </div>
        </div>
        <div class="filter">
            <input type="text" v-model="filter" class="form-control" placeholder="Filter file">
        </div>
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>
        <div v-if="messageAlert" class="alert alert-info">
            {{ messageAlert }}
        </div>
        <ul v-if="files.length > 0">
            <li v-for="(_fileName, index) in files" 
                :key="index"
                :title="_fileName"
                @click="openFile(_fileName)"
                :class="{active: _fileName == current && loaded}">
                {{ _fileName }}
            </li>
        </ul>

        <div class="modal fade" tabindex="-1" role="dialog" id="open-dir-modal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Open directory</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <label for="">Write a valid path</label>
                        <input type="text" 
                            v-model="newPath" 
                            placeholder="path/dir" 
                            class="form-control" 
                            ref="newPath"
                            autofocus
                            @keypress.enter="setNewPath">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="setNewPath">
                            Save dir
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" tabindex="-1" role="dialog" id="search-modal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Search in files</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <label for="">Search</label>
                        <input type="text" 
                            v-model="toSearch" 
                            ref="search"
                            placeholder="search" 
                            class="form-control" 
                            autofocus
                            @keypress.enter="search">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="search">
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios'
import $ from 'jquery'
import config from '../../config/app'

export default {
    data () {
        return {
            newPath: '',
            path: '',
            filter: '',
            files: [],
            allFiles: [],
            userSays: [],
            file: '',
            toSearch: '',
            loaded: false,
            opened: false,
            current: '',
            next: '',
            messageAlert: '',
            error: ''
        }
    },

    mounted () {
        this.path = localStorage.getItem('path')
        this.newPath = this.path
        this.loadFiles()

        $('.modal').on('shown.bs.modal', () => {
            this.$refs.search.focus()
            this.$refs.newPath.focus()
        });
    },

    methods: {

        // get the list of files from the api server
        loadFiles () {
            this.messageAlert = ''
            this.files = []
            this.error = ''
            localStorage.setItem('path', this.path)
            axios.get(config.server + '/files', {
                params: {
                    path: this.path,
                    toSearch: this.toSearch
                }
            })
              .then(res => {
                  this.files = res.data.files.filter(f => !f.includes('usersays'))
                  this.allFiles = this.files

                  if (this.files.length === 0) {
                      this.messageAlert = "No results"
                  }
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
                this.userSays = JSON.parse(res.data.userSaysFile)
                this.$emit('loadFile', fileName, this.file, this.userSays)
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

        setNewPath () {
            this.path = this.newPath
            this.loadFiles()
            $('#open-dir-modal').modal('hide')
        },

        search () {
            this.loadFiles()
            $('#search-modal').modal('hide')
        }

    },

    watch: {
        filter (val) {
            val = val.toLowerCase()
            this.files = this.allFiles
                             .filter(file => file.toLowerCase().includes(val))
        }
    }
}
</script>

<style lang="scss" scoped>

.path {
    background: var(--gray);
    color: white;
    padding: 0.25em;
    font-size: 85%;
    font-style: italic;
    span {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    > div {
        text-align: right;
        width: 150px;
    }
}
.filter {
    background: var(--gray);
    padding: 0;

}
ul {
    padding: 0;
    li {
        color: white;
        overflow: hidden;
        width: 100%;
        padding: 0.1em 0 0.1em 1em;
        border-top: 1px solid rgba(#000, 0.1);
        text-overflow: ellipsis;
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

