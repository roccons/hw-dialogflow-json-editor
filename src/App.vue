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
                        <div class="input" v-for="(speech, idx) in msg.speech" :key="idx" >
                          <textarea
                            rows="2"
                            v-model="msg.speech[idx]"
                            class="form-control"></textarea>
                          <button class="btn btn-danger btn-sm"
                            v-if="msg.speech.length > 1"
                            @click="removeSpeechResponse(msg.speech, idx)">
                            &times;
                          </button>
                        </div>
                        <div class="input">
                          <textarea rows="2" class="form-control"></textarea>
                          <button class="btn btn-success btn-sm" @click="addSpeechResponse($event, speeches[index], true)">
                            +
                          </button>
                        </div>
                      </div>
                      <br>
                    </template>
                  </div>
                  
                  <!-- ...or a string -->
                  <div class="speech" v-else>
                    <span class="number">{{ index + 1 }}</span>
                    <div class="inputs">
                      <div class="input">
                        <textarea
                          rows="2"
                          v-model="msg.speech"
                          class="form-control"></textarea>
                      </div>
                      <div class="input">
                        <textarea rows="2" class="form-control" ></textarea>
                          <button class="btn btn-success btn-sm" @click="addSpeechResponse($event, speeches[index])">
                            +
                          </button>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
              <button class="btn btn-success" @click="addSpeech">+ Add speech</button>
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
      path: null,
      loaded: false,
      saved: false,
      error: '',
      speeches: [],
      suggestions: [],
      redirectToBlocks: [],
      totalSpeeches: 0,
    }
  },

  mounted () {
    this.path = localStorage.getItem('path')
  },
  
  methods: {
    loadFile (fileName, file) {
      this.getPath()
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

        // get total speeches to dont show them if have no items
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
      let messages = this.file.responses[0].messages.filter(m => m.type !== 0)
      messages = messages.concat(this.speeches)

      this.file.responses[0].messages = messages

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

    getPath () {
      if (this.path === null || this.path === 'null') {
        this.path = localStorage.getItem('path')
      }
    },

    addSpeechResponse (e, speech, isArray) {
      const el = e.target.previousElementSibling
      if (!el.value) {
        return
      }
      if (isArray) {
        speech.speech.push(el.value)
      } else {
        speech.speech = [speech.speech, el.value]
      }
      el.value = ''
      el.focus()
    },

    removeSpeechResponse (array, index) {
      array.splice(index, 1)
    },

    addSpeech () {
      this.speeches.push({
        type: 0,
        lang: 'es',
        speech: ['-- change this --']
      })
    }

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
      .input {
        display: flex;
        align-items: flex-start;
        button {
          position: relative;
        }
      }
    }
  }
}

.number {
  font-size: 250%;
  display: inline-block;
  padding-right: 0.25em;
}
</style>
