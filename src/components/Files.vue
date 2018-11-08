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

        <div class="modal fade" tabindex="-1" role="dialog" id="confirm-dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm</h5>
                    </div>
                    <div class="modal-body">
                        <p>Discard changes?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="stay">Cancel</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="discard">
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios'
import config from '../../config/app.js'
import $ from 'jquery'

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
                if (this.opened) {
                    $('#confirm-dialog').modal()
                } else {
                    this.loadFile(fileName)
                }
            }
        },

        // stay editing the file
        stay () {
            $('#confirm-dialog').modal('hide')
        },

        // discard changes and move to the next file
        discard () {
            this.loadFile(this.next)
        }
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

