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
              </v-carousel>
            </v-card>
          </v-layout>
        </v-col>
      </v-row>
    </v-container-fluid>
  </v-responsive>
</template>
