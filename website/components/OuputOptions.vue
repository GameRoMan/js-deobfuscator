<script setup lang="ts">
import json5 from 'json5'
import { options } from '#imports'

const dialog = ref<HTMLDialogElement>()

function openDialog() {
  dialog.value?.showModal()
}

function handleDialogClick(evt: MouseEvent) {
  if (evt.target === evt.currentTarget)
    dialog.value?.close()
}

const keywordsValue = ref(JSON.stringify(options.value.keywords))

watchEffect(() => {
  try {
    options.value.keywords = json5.parse(keywordsValue.value)
  }
  catch (error) {
    console.error(error)
    options.value.keywords = []
  }
})
</script>

<template>
  <div flex items-center justify-center>
    <button class="i-ri:settings-line" @click="openDialog" />
    <dialog ref="dialog" min-h-130 rounded p0 @click="handleDialogClick">
      <div py2 text-center text-lg font-bold>
        Deobfuscation Configuration
        <button
          class="i-ri:close-line"
          float-right
          p4
          @click="dialog?.close()"
        />
      </div>
      <hr />

      <div px-4 py-2 w-40vw>
        <div flex="~ col gap-2" text-base w-full>
          <div class="border-b border-gray-200 text-lg">
            Decrypt configuration
          </div>
          <label class="inline-flex items-center gap-2">
            <div class="flex-1">
              <span mr-2>Decoder location method</span>
              <select
                v-model="options.decoderLocationMethod"
                class="pl-0.5 border border-gray-300 bg-white shadow-sm focus:(outline-none ring) dark:bg-gray-700"
              >
                <option value="stringArray">String Array</option>
                <option value="callCount">Call count</option>
                <option value="evalCode">Eval code</option>
              </select>
            </div>

            <div v-if="options.decoderLocationMethod === 'callCount'">
              Number of calls
              <input
                v-model="options.decoderCallCount"
                class="pl-0.5 border border-gray-300 bg-white shadow-sm focus:(outline-none ring) dark:bg-gray-700"
                type="number"
                w-16
                min="1"
                step="1"
              />
            </div>

            <div v-if="options.decoderLocationMethod === 'stringArray'">
              Length of string array
              <input
                v-model="options.stringArraylength"
                class="pl-0.5 border border-gray-300 bg-white shadow-sm focus:(outline-none ring) dark:bg-gray-700"
                type="number"
                w-16
                min="1"
                step="1"
              />
            </div>
            <div
              v-if="options.decoderLocationMethod === 'evalCode'"
              class="inline-flex items-center gap-2"
            >
              <span>Specify the decryptor (function name)</span>
              <input
                v-model="options.designDecoderName"
                class="pl-0.5 border border-gray-300 bg-white shadow-sm focus:(outline-none ring) dark:bg-gray-700"
                w-32
                type="input"
              />
            </div>
          </label>

          <CodeEditor
            v-if="options.decoderLocationMethod === 'evalCode'"
            v-model="options.setupCode"
            class="!h-40"
            language="javascript"
          />

          <label class="inline-flex items-center gap-2">
            <span class="flex-1">Decryptor nesting function depth</span>
            <input
              v-model="options.inlineWrappersDepth"
              class="pl-0.5 border border-gray-300 bg-white shadow-sm focus:(outline-none ring) dark:bg-gray-700"
              type="number"
              w-16
              min="1"
              step="1"
            />
          </label>
          <label class="inline-flex items-center gap-2">
            <span class="flex-1"
              >Obfuscated junk instructions restore execution count</span
            >
            <input
              v-model="options.execCount"
              class="pl-0.5 border border-gray-300 bg-white shadow-sm focus:(outline-none ring) dark:(bg-gray-700 disabled-bg-gray-900) disabled:bg-gray-100"
              type="number"
              w-16
              min="1"
              max="5"
              step="1"
            />
          </label>
          <label class="inline-flex items-center gap-2">
            <span class="flex-1"
              >Remove the decryptor (it won't be needed later).</span
            >
            <input v-model="options.isRemoveDecoder" type="checkbox" />
          </label>
          <label class="inline-flex items-center gap-2">
            <span class="flex-1"
              >Forceful cleanup (will re-execute the processed code)</span
            >
            <input v-model="options.isStrongRemove" type="checkbox" />
          </label>

          <div class="border-b border-gray-200 text-lg mt-2">
            Output configuration
          </div>
          <label class="inline-flex items-center gap-2">
            <span class="flex-1">Minify the code</span>
            <input v-model="options.isMinifiedEnable" type="checkbox" />
          </label>

          <label class="inline-flex items-center gap-2">
            <span class="flex-1">Mangle variable names</span>
            <input v-model="options.mangle" type="checkbox" />
          </label>
          <label class="inline-flex items-center gap-2">
            <span class="flex-1">Whether to mark key identifiers</span>
            <input v-model="options.isMarkEnable" type="checkbox" />
          </label>
          <label class="inline-flex items-center gap-2">
            <span class="flex-1">identifier</span>
            <input
              v-model="keywordsValue"
              class="pl-0.5 border border-gray-300 bg-white shadow-sm focus:(outline-none ring) dark:(bg-gray-700 disabled-bg-gray-900) disabled:bg-gray-100"
              type="input"
            />
          </label>
        </div>
      </div>
    </dialog>
  </div>
</template>
