<script setup>
import '@/assets/homepage.css'

const cameras = ['images/camera3.png', 'images/camera2.jpg', 'images/camera4.jpg']

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    // Add a tiny offset to prevent layout jumps
    const offset = section.getBoundingClientRect().top + window.scrollY - 1
    window.scrollTo({
      top: offset,
      behavior: 'smooth',
    })
  }
}
</script>

<template>
  <v-responsive>
    <v-container-fluid>
      <v-row>
        <v-col>
          <v-layout>
            <v-card
              id="home"
              :elevation="4"
              color="grey-darken-4"
              class="mx-auto pa-0 ma-0"
              width="100%"
              style="text-align: center; border-radius: 0"
            >
              <!--Carousel-->
              <v-carousel :show-arrows="false" cycle hide-delimeters height="1000px">
                <v-carousel-item
                  v-for="(camera, i) in cameras"
                  :key="i"
                  :src="camera"
                  draggable="false"
                  cover
                >
                </v-carousel-item>
                <div class="logo-text">
                  <img
                    src="/images/logo-text1.png"
                    draggable="false"
                    class="img-logo"
                    :style="{ width: mobile ? '100%' : '45%', height: 'auto' }"
                  />
                </div>

                <!--Carousel logo-->
                <div class="carousel-logo">
                  <div class="carousel-appbar">
                    <v-layout>
                      <v-class class="adjust-button ml-4">
                        <v-btn variant="plain" class="button" @click="scrollToSection('products')">
                          <h6><b>About</b></h6></v-btn
                        >
                        <v-btn variant="plain" class="button" @click="scrollToSection('developers')"
                          ><h6><b>Developers</b></h6></v-btn
                        >
                        <v-btn variant="plain" class="button" @click="scrollToSection('contact')"
                          ><h6><b>Contact</b></h6></v-btn
                        >
                      </v-class>
                    </v-layout>
                  </div>
                  <div class="carousel-text">
                    <v-btn class="mt-8 start-revert">
                      <router-link to="/login" style="text-decoration: none; color: #333">
                        <p>Let's Start!</p>
                      </router-link>
                    </v-btn>
                    <v-btn
                      class="mt-8 ml-3 start-revert adjust-explore"
                      @click="scrollToSection('main')"
                    >
                      <p>Explore More!</p>
                    </v-btn>
                  </div>
                </div>
              </v-carousel>
            </v-card>
          </v-layout>
        </v-col>
      </v-row>
    </v-container-fluid>
  </v-responsive>
</template>
