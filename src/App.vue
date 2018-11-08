<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-3 files">
          <Files @loadFile="loadFile"></Files>
        </div>
        <div class="editor col-sm-9" v-if="loaded">
          <div class="title d-flex justify-content-between px-3 py-3">
            <h2>{{ file.name || ''}}</h2>
            <button class="btn btn-primary" @click="save">
              Save
            </button>
          </div>
          <div class="px-3 py-3">

            <div class="alert alert-success" v-if="saved">
              File saved successfully
            </div>
            <div class="alert alert-danger" v-if="error">
              {{ error }}
            </div>

            <template v-if="speeches.length > 0 && totalSpeeches > 0">
              <h4>Speeches</h4>
              <div v-for="(msg, index) in speeches" :key="index">
                <div class="speeches">

                  <!-- speech can be an array: -->
                  
                  <div v-if="typeof msg.speech === 'object'" class="speech">
                    <template v-if="msg.speech.length > 0">
                      <span class="number">{{ index + 1 }}</span>
                      <div class="inputs">
                        <textarea
                          rows="2"
                          v-for="(speech, idx) in msg.speech" 
                          :key="idx"
                          v-model="msg.speech[idx]"
                          class="form-control">
                          </textarea>
                      </div>
                      <br>
                    </template>
                  </div>
                  
                  <!-- ...or a string -->
                  <div class="speech" v-else>
                    <span class="number">{{ index + 1 }}</span>
                    <div class="inputs">
                      <textarea
                        rows="2"
                        v-model="msg.speech"
                        class="form-control"></textarea>
                    </div>
                  </div>

                </div>
              </div>
              <hr>
            </template>

            <template v-if="suggestions.length > 0">
              <h4>Suggestions (Quickreplies)</h4>
              <textarea
                rows="1"
                v-for="(item, idxs) in suggestions" 
                :key="idxs + '_'" 
                v-model="item.title"
                class="form-control"></textarea>
                <hr>
            </template>

            <template v-if="redirectToBlocks.length > 0">
              <h4>Redirect to blocks</h4>
              <textarea
                rows="1"
                v-for="(item, index) in redirectToBlocks" 
                :key="index"
                v-model="redirectToBlocks[index]"
                class="form-control"></textarea>
            </template>

          </div>
        </div>
        <div v-else class="px-4">
          -
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Files from './components/Files.vue'
import axios from 'axios'
import config from '../config/app.js'

export default {
  name: 'app',
  components: {
    Files
  },

  data () {
    return {
      file: {}, // json object
      fileName: '',
      loaded: false,
      saved: false,
      error: '',
      speeches: [],
      suggestions: [],
      redirectToBlocks: [],
      totalSpeeches: 0
    }
  },

  mounted () {
    this.path = localStorage.getItem('path')
  },
  
  methods: {
    loadFile (fileName, file) {
      this.error = null
      this.loaded = true
      this.saved = false
      this.fileName = fileName
      this.file = file
      this.speeches = []
      this.suggestions = []
      this.redirectToBlocks = []
      this.totalSpeeches = 0
      if (file.responses) { //if it is a valid file
        file.responses[0].messages.forEach(msg => {
          // suggestions (quickreplies)
          if (msg.type === 'suggestion_chips') {
            this.suggestions = msg.suggestions
          }
          // speech
          if (msg.type === 0) {
            this.speeches.push(msg)
          }
  
          // Custom payload
          if (msg.type === 4) {
            this.redirectToBlocks = msg.payload.redirect_to_blocks
          }
        });

        file.responses[0].messages.forEach(msg => {
          if (msg.type === 0) {
            if (msg.speech.length > 0) {
              this.totalSpeeches++
            }
          }
        })
      }
    },

    // the data edited is an array, so javascript modify the original and we can 
    // send this.file as data 
    save () {
      axios.post(config.server + '/file', {
        file: this.path + '/' + this.fileName,
        newData: this.file
      })
      .then(() => {
        this.saved = true
        this.error = null
        setTimeout(() => { this.saved = false }, 10000)
      })
      .catch(err => {
        this.error = err.response ? err.response.data.message : err
      })
    },

  }
}
</script>

<style lang="scss">

#app, .row {
  height: 100vh;;
}

.files {
  background: var(--dark);
  min-height: 100%;
  padding: 0 !important;
  overflow: auto;
}
.editor {
  background: var(--light);
  min-height: 100%;
  overflow: auto;
  padding: 0 !important;
  .title {
    background: white;
    box-shadow: 0 0.1em 0.1em rgba(0,0,0,0.1);
  }
}

.speeches {
  .speech {
    display: flex;
    align-items: center;
    margin-bottom: 1em;
    .inputs {
      width: 100%;
    }
  }
}

.number {
  font-size: 250%;
  display: inline-block;
  padding-right: 0.25em;
}
</style>
