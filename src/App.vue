<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-3 files">
          <Files @loadFile="loadFile"></Files>
        </div>
        <div class="editor col-sm-9" v-if="loaded" @keypress="disabled=false">
          <div class="title d-flex justify-content-between px-3 py-3">
            <h2>{{ file.name || ''}}</h2>
            <div>
              <button class="btn mr-2" @click="openFile" :disabled="openDisabled">
                Open 
              </button>
              <button class="btn btn-primary" @click="save" :disabled="disabled">
                Save
              </button>
            </div>
          </div>
          <div class="px-3 py-3">

            <div class="alert alert-success" v-if="saved">
              File saved successfully
            </div>
            <div class="alert alert-danger" v-if="error">
              {{ error }}
            </div>

            <div class="readonly-blocks" v-if="userSays && userSays.length">
              <h4>Training Phrases</h4>
              <div class="readonly-block" v-for="(trainingPhrase, index) in userSays" :key="index">
                {{ trainingPhrase.data.map(phrase => phrase.text).join(' | ')}}
              </div>
            </div>

            <hr>

            <template v-if="speeches && speeches.length > 0 && totalSpeeches > 0">
              <h4>Speeches</h4>
              <div v-for="(msg, index) in speeches" :key="index">
                <div class="speeches">

                  <!-- speech can be an array: -->
                  
                  <div v-if="msg && typeof msg.speech === 'object'" class="speech">
                    <template v-if="msg.speech.length >= 0">
                      <div class="number">
                        <span>{{ index + 1 }}</span>
                        <button v-if="speeches.length > 1" 
                          @click="deleteSpeech(index)" 
                          class="btn btn-sm" title="delete">
                          <span class="icon-bin"></span>
                        </button>
                      </div>
                      <div class="inputs">
                        <div class="input" v-for="(speech, idx) in msg.speech" :key="idx" >
                          <textarea
                            rows="2"
                            placeholder="Enter a text response variant"
                            v-model="msg.speech[idx]"
                            class="form-control"></textarea>
                          <button class="btn" title="delete"
                            v-if="msg.speech.length > 1"
                            @click="removeSpeechResponse(msg.speech, idx)">
                            <span class="icon-bin"></span>
                          </button>
                        </div>
                        <div class="input add">
                          <textarea 
                            rows="2" class="form-control" placeholder="Enter a text response variant"
                            @keypress.enter="addSpeechResponse($event, speeches[index], true)"></textarea>
                        </div>
                      </div>
                      <br>
                    </template>
                  </div>
                  
                  <!-- ...or a string -->
                  <div class="speech" v-else>
                    <div class="number">
                      <span>{{ index + 1 }}</span>
                      <button 
                        v-if="speeches && speeches.length > 1"
                        @click="deleteSpeech(index)" 
                        class="btn btn-sm" title="delete">
                          <span class="icon-bin"></span>
                      </button>
                    </div>

                    <div class="inputs">
                      <div class="input">
                        <textarea
                          rows="2"
                          placeholder="Enter a text response variant"
                          v-model="msg.speech"
                          class="form-control"></textarea>
                      </div>
                      <div class="input add" v-if="msg.speech">
                        <textarea
                          rows="2" class="form-control" placeholder="Enter a text response variant"
                          @keypress.enter="addSpeechResponse($event, speeches[index])"></textarea>
                          <br>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
              <br>
              <button class="btn btn-success" @click="addSpeech">+ Add speech</button>
              <hr>
            </template>

            <template v-if="suggestions && suggestions.length > 0">
              <h4>Suggestions (Quickreplies)</h4>
              <textarea
                rows="1"
                v-for="(item, idxs) in suggestions" 
                :key="idxs + '_'" 
                v-model="item.title"
                class="form-control"></textarea>
                <hr>
            </template>

            <template v-if="redirectToBlocks && redirectToBlocks.length > 0">
              <h4>Redirect to blocks</h4>
              <textarea
                rows="1"
                v-for="(item, index) in redirectToBlocks" 
                :key="index"
                v-model="redirectToBlocks[index]"
                class="form-control"></textarea>
            </template>

            <template v-if="fbQuickReplies && fbQuickReplies.length > 0">
              <div class="readonly-blocks">
                <h4>Quick Replies (Facebook)</h4>
                <div class="readonly-block" v-for="(fbReply, idx) in fbQuickReplies" :key="idx">
                  {{ fbReply }}
                </div>
              </div>
              <hr>
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
<style lang="scss">
  @import "scss/index.scss";
</style>



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
      userSays: [],
      disabled: true,
      openDisabled: false,
      path: null,
      loaded: false,
      saved: false,
      error: '',
      speeches: [],
      suggestions: [],
      fbQuickReplies: [],
      redirectToBlocks: [],
      totalSpeeches: 0,
    }
  },

  mounted () {
    this.path = localStorage.getItem('path')
  },
  
  methods: {
    loadFile (fileName, file, userSays) {
      this.getPath()
      this.userSays = userSays
      this.error = null
      this.disabled = true
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
          // facebook quickreplies
          if (msg.type === 2 && msg.platform === 'facebook') {
            this.fbQuickReplies = msg.replies
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
        this.disabled = true
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
      this.disabled = false
      e.preventDefault()
      const el = e.target
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
      this.disabled = false
      array.splice(index, 1)
    },

    addSpeech () {
      this.disabled = false
      this.speeches.push({
        type: 0,
        lang: 'es',
        speech: []
      })
    },

    deleteSpeech (index) {
      this.disabled = false
      this.speeches.splice(index, 1)
    },

    openFile () {
      this.openDisabled = true
      axios.post(config.server + '/file/exec', { file: this.path + '/' + this.fileName, })
      .then(() => {
        this.openDisabled = false
      })
      .catch(() => {
        this.openDisabled = false
        this.error = 'Unable to open the file'
      })
    }

  }
}
</script>