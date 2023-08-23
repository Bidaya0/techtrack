<template>
  <v-card>
    <v-card-text >
            <v-btn
              
              dark
              fab
              top
              right
              color="yellow"
              v-on:click="doSomething"
            >
              <v-icon>mdi-sync</v-icon>
            </v-btn>
          </v-card-text>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Url</th>
          <th class="text-left">isNew</th>
          <th class="text-left">ring</th>
          <th class="text-left">quadrant</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatingData.docs" :key="item.name">
          <td>{{ item.name }}</td>
          <td>{{ item.url }}</td>
          <td>          <v-select
            v-model="item.isNew"
            :items="isNewOptions"
          ></v-select></td>
          <td>

          <v-select
            v-model="item.ring"
            :items="ringOptions"
          ></v-select></td><td>
          <v-select
            v-model="item.quadrant"
            :items="quadrantOptions"
          ></v-select></td><br>
        </tr>
      </tbody>
      <template v-slot:bottom>
      <div class="text-center pt-2">
        <v-pagination
          v-model="page"
          :length="totalPages"
        ></v-pagination>
        <v-text-field
          :model-value="page_size"
          class="pa-2"
          label="Items per page"
          type="number"
          min="-1"
          max="15"
          hide-details
          @update:model-value="page_size = parseInt($event, 10)"
        ></v-text-field>
      </div>
    </template>
    </v-table>
  </v-card>
</template>

<style>
  /* This is for documentation purposes and will not be needed in your application */
  #lateral .v-btn--example {
    position: fixed;
  }
</style>
<script lang="ts">
import { stringLiteral } from "@babel/types";
import axios from 'axios';
import { totalmem } from "os";

const get_data_with_page_size = (data: any,page_size: number , page: number) => {
  const totalPages = Math.ceil(data.length / page_size);
  const currentPage = page || 1;
  const start = (currentPage - 1) * page_size;
  const end = start + page_size;
  const paginatedResults = data.slice(start, end);
  return {
    docs: paginatedResults,
    totalPages: totalPages,
    currentPage: currentPage,
  };
}

export default {
  methods: {
    doSomething() {
      console.log(this.repos);
      axios
      .post('/api/raderdata', this.repos)
      .then((response) => {
        console.log(response)
      })
    },
  },
  data() {
    return {
      repos: [
        {
          name: "bleve",
          url: "https://github.com/blevesearch/bleve",
          isNew: "TRUE",
          ring: "tools",
          quadrant: "assess",
          description: "embedding full-text search",
        },
        {
          name: "jekyll-metaweblog",
          url: "https://github.com/tominsam/jekyll-metaweblog",
        },
        { name: "d2l-en", url: "https://github.com/d2l-ai/d2l-en" },
      ],
      page:1,
      page_size:10,
      fab: true,
      hidden: false,
      tabs: null,
      isNewOptions: ["TRUE", "FALSE"],
      quadrantOptions: [
        "tools",
        "techniques",
        "platforms",
        "languages & frameworks",
      ],
      ringOptions: ["adopt", "trial", "assess", "hold"],
    };
  },
  computed: {
    activeFab() {
      switch (this.tabs as unknown as string) {
        case "one":
          return { color: "success", icon: "mdi-share-variant" };
        case "two":
          return { color: "red", icon: "mdi-pencil" };
        case "three":
          return { color: "green", icon: "mdi-chevron-up" };
        default:
          return {};
      }
    },
    paginatingData(){
  const start = (this.page - 1) * this.page_size;
  const end = start + this.page_size;
  const paginatedResults = this.repos.slice(start, end);
  return {
    docs: paginatedResults,
  };
},
totalPages(){
  const totalPages = Math.ceil(this.repos.length / this.page_size);
  return totalPages;
}
  },
  mounted() {
    axios
      .get('/api/raderdata')
      .then((response) => {
        console.log(response)
        this.repos = response.data
      })
  }

};
</script>
