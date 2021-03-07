<template>
  <div id="app">
    <HelloWorld />
    <div class="search-input">
      <i class="iconfont iconsearch"></i>
      <input
        type="text"
        placeholder="搜索歌曲"
        v-model="searchWord"
        @input="handleToSuggest"
        @keyup.enter="handleToList(searchWord)"
      />
      <i
        class="iconfont iconguanbi"
        v-if="searchType != 1"
        @click="handleToClose"
      ></i>
    </div>
    <template v-if="searchType == 1">
      <div class="search-history">
        <div class="search-history-head">
          <span>历史记录</span>
          <i class="iconfont iconlajitong" @click="handleToClear"></i>
        </div>
        <div class="search-history-list">
          <div
            v-for="(item, index) in searchHistory"
            :key="index"
            @click="handleToList(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
      <div class="search-hot">
        <div class="search-hot-head">热搜榜</div>
        <div
          class="search-hot-item"
          v-for="(item, index) in searchHot"
          :key="index"
        >
          <div class="search-hot-top">{{ index + 1 }}</div>
          <div class="search-hot-word">
            <div>
              {{ item.searchWord }}
              <img v-show="item.iconUrl" :src="item.iconUrl" />
            </div>
            <div>{{ item.content }}</div>
          </div>
          <span class="search-hot-count">{{ item.score }}</span>
        </div>
      </div>
    </template>
    <template v-else-if="searchType == 2">
      <div class="search-result">
        <div
          class="search-result-item"
          v-for="(item, index) in searchList"
          :key="index"
        >
          <div class="search-result-word">
            <div>{{ item.name }}</div>
            <div>{{ item.artists[0].name }} - {{ item.album.name }}</div>
          </div>
          <i class="iconfont iconbofang"></i>
        </div>
      </div>
    </template>
    <template v-else-if="searchType == 3">
      <div class="search-suggest">
        <div class="search-suggest-head">搜索“ {{ searchWord }} ”</div>
        <div
          class="search-suggest-item"
          v-for="(item, index) in searchSuggest"
          :key="index"
          @click="handleToList(item.keyword)"
        >
          <i class="iconfont iconsearch"></i>
          {{ item.keyword }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import "/src/assets/iconfont/iconfont.css";
import axios from "axios";
import { reactive, ref, toRefs, onMounted, defineComponent, Ref } from "vue";

import { provideStore } from "./useSearchWord";
import HelloWorld from "./components/HelloWorld.vue";
import { ISearchHotItem, ISearchListItem, ISearchSuggest } from "./types";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
  },
  setup() {
    const searchType = ref(1);
    const searchWord = ref("");

    provideStore(searchWord);

    const { searchHot } = useSearchHot();

    const { searchSuggest, handleToSuggest } = useSearchSuggest(
      searchType,
      searchWord
    );

    const { searchHistory, handleToClear, setToHistory } = useSearchHistory();

    const { searchList, handleToClose, handleToList } = useSearchList(
      searchType,
      searchWord,
      function (word: string) {
        setToHistory(word);
      }
    );

    return {
      searchType,
      searchWord,
      searchHot,
      searchSuggest,
      handleToSuggest,
      searchList,
      handleToClose,
      handleToList,
      searchHistory,
      handleToClear,
    };
  },
});

function useSearchHot() {
  
  const state = reactive({
    searchHot: [] as ISearchHotItem[],
  });
  onMounted(() => {
    axios.get("/api/search/hot/detail").then((res) => {
      state.searchHot = res.data.data;
    });
  });
  return toRefs(state);
}

function useSearchSuggest(searchType: Ref<number>, searchWord: Ref<string>) {
  
  const state = reactive({
    searchSuggest: [] as ISearchSuggest[],
  });
  const { searchSuggest } = toRefs(state);
  const handleToSuggest = () => {
    if (!searchWord.value) {
      searchType.value = 1;
      return;
    }
    axios
      .get(`/api/search/suggest?keywords=${searchWord.value}&type=mobile`)
      .then((res) => {
        state.searchSuggest = res.data.result.allMatch;
        searchType.value = 3;
      });
  };
  return {
    searchSuggest,
    handleToSuggest,
  };
}
function useSearchList(
  searchType: Ref<number>,
  searchWord: Ref<string>,
  callback: (w: string) => void
) {
  
  const state = reactive({
    searchList: [] as ISearchListItem[],
  });
  const { searchList } = toRefs(state);
  const handleToClose = () => {
    searchWord.value = "";
    searchType.value = 1;
  };
  const handleToList = (word: string) => {
    searchWord.value = word;
    callback(word);
    getSearchList();
  };
  const getSearchList = () => {
    axios.get(`/api/search?keywords=${searchWord.value}`).then((res) => {
      state.searchList = res.data.result.songs;
      searchType.value = 2;
    });
  };
  return {
    searchList,
    handleToClose,
    handleToList,
  };
}

function useSearchHistory() {
  type Data = {
    searchHistory: string[];
  };
  const state: Data = reactive({
    searchHistory: [],
  });
  const { searchHistory } = toRefs(state);
  const handleToClear = () => {
    removeStorage({
      key: "searchHistory",
      success: () => {
        state.searchHistory = [];
      },
    });
  };
  const setToHistory = (word: string) => {
    state.searchHistory.unshift(word);
    state.searchHistory = [...new Set(state.searchHistory)];
    if (state.searchHistory.length > 10) {
      state.searchHistory.length = 10;
    }
    setStorage({
      key: "searchHistory",
      data: state.searchHistory,
    });
  };
  onMounted(() => {
    getStorage({
      key: "searchHistory",
      success: (data) => {
        state.searchHistory = data;
      },
    });
  });
  return {
    searchHistory,
    handleToClear,
    setToHistory,
  };
}

function setStorage({ key, data }: { key: string; data: string[] }) {
  window.localStorage.setItem(key, JSON.stringify(data));
}
function getStorage({
  key,
  success,
}: {
  key: string;
  success: (arg: []) => void;
}) {
  let data = window.localStorage.getItem(key);
  if (typeof data == "string") {
    success(JSON.parse(data));
  } else {
    success([]);
  }
}
function removeStorage({ key, success }: { key: string; success: () => void }) {
  window.localStorage.removeItem(key);
  success();
}
</script>

<style>
.search-input {
  display: flex;
  align-items: center;
  height: 35px;
  margin: 35px 15px 25px 15px;
  background: #f7f7f7;
  border-radius: 25px;
}
.search-input i {
  margin: 0 13px;
}
.search-input input {
  flex: 1;
  font-size: 14px;
  border: none;
  background: #f7f7f7;
  outline: none;
}
.search-history {
  margin: 0 15px 25px 15px;
  font-size: 14px;
}
.search-history-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}
.search-history-list {
  display: flex;
  flex-wrap: wrap;
}
.search-history-list div {
  padding: 8px 14px;
  border-radius: 20px;
  margin-right: 15px;
  margin-bottom: 15px;
  background: #f7f7f7;
}
.search-hot {
  margin: 0 15px;
  font-size: 14px;
}
.search-hot-head {
  margin-bottom: 18px;
}
.search-hot-item {
  display: flex;
  align-items: center;
  margin-bottom: 29px;
}
.search-hot-top {
  color: #fb2222;
  width: 30px;
  margin-left: 4px;
}
.search-hot-word {
  flex: 1;
}
.search-hot-word div:nth-child(1) {
  font-size: 16px;
  color: black;
}
.search-hot-word div:nth-child(2) {
  font-size: 12px;
  color: #878787;
}
.search-hot-word img {
  height: 12px;
}
.search-hot-count {
  color: #878787;
}
.search-result {
  border-top: 1px #e4e4e4 solid;
  padding: 15px;
}
.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px #e4e4e4 solid;
}
.search-result-word div:nth-child(1) {
  font-size: 16px;
  color: #235790;
  margin-bottom: 6px;
}
.search-result-word div:nth-child(2) {
  font-size: 14px;
  color: #898989;
}
.search-result-item i {
  font-size: 30px;
  color: #878787;
}
.search-suggest {
  border-top: 1px #e4e4e4 solid;
  padding: 15px;
  font-size: 14px;
}
.search-suggest-head {
  color: #4574a5;
  margin-bottom: 37px;
}
.search-suggest-item {
  color: #5d5d5d;
  margin-bottom: 37px;
}
.search-suggest-item i {
  color: #bdbdbd;
  margin-right: 14px;
  position: relative;
  top: 1px;
}
</style>
