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
              <v-carousel :show-arrows="false" cycle height="1000px" hide-delimiters>
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

                <!--Carousel log-->
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

              <!--Main-->
              <v-main id="main">
                <v-container fluid>
                  <v-row style="padding-top: 100px">
                    <v-col></v-col>
                    <v-col cols="12" md="10" class="d-flex justify-center">
                      <v-img
                        style="width: 20%"
                        src="/images/logo-text1.png"
                        contain
                        max-width="400"
                        max-height="100"
                      ></v-img>
                    </v-col>
                    <v-col></v-col>
                    <v-col cols="12" md="2"></v-col>
                    <v-col cols="12" md="8" class="mb-15">
                      <p class="mt-1">
                        Your go-to platform for camera rentals, offering the latest equipment to
                        ensure you capture every moment in stunning quality. Whether you're a
                        seasoned photographer or just starting out, we have something for everyone.
                      </p>
                    </v-col>

                    <!--Row 2 and 3-->
                    <v-row id="products" class="pa-5">
                      <v-divider></v-divider>
                      <v-col cols="12" md="1" class="mt-10"></v-col>
                      <v-col cols="12" md="4" class="mt-10 reduce-gap">
                        <v-img
                          src="/images/goal.png"
                          contain
                          max-width="400"
                          max-height="100"
                        ></v-img>
                      </v-col>
                      <v-col cols="12" md="6" class="mt-10">
                        <p class="mt-2">
                          We aim to provide high-quality cameras for those who can't afford to buy,
                          especially students and individuals with occasional needs, making
                          creativity accessible to everyone.
                        </p>
                      </v-col>
                      <v-col cols="12" md="1" class="mt-10 reduce-gap"></v-col>

                      <!--Row 3-->
                      <v-col cols="12" md="1" class="mt-10 reduce-gap"></v-col>
                      <v-col cols="12" md="4" class="mt-10 reduce-gap">
                        <v-card
                          class="mx-auto"
                          prepend-icon="mdi-camera-enhance-outline"
                          subtitle="Rent Cameras for low prices"
                          height="400px"
                          style="border-radius: 20px"
                          variant="outlined"
                        >
                          <template v-slot:title>
                            <span class="font-weight-normal">Equipment Lease</span>
                          </template>

                          <v-img
                            src="/images/rent_cameras.png"
                            class="mx-auto fill-height"
                            cover
                          ></v-img>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="6" class="mt-10">
                        <v-card
                          class="mx-auto"
                          prepend-icon="mdi-camera-outline  "
                          subtitle="Rent out your camera"
                          height="400px"
                          style="border-radius: 20px"
                          variant="outlined"
                        >
                          <template v-slot:title>
                            <span class="font-weight-normal">Provider</span>
                          </template>

                          <v-img src="/images/rental.png" class="mx-auto" cover></v-img>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="1" class="mt-10 reduce-gap"></v-col>

                      <!--Row 4-->
                      <v-col cols="12" md="1" class="mt-10 reduce-gap"></v-col>
                      <v-col cols="12" md="4" class="mt-10 reduce-gap">
                        <v-card
                          class="mx-auto"
                          prepend-icon="mdi-percent-box-outline"
                          subtitle="Offers special pricing and packages for students"
                          height="400px"
                          style="border-radius: 20px"
                          variant="outlined"
                        >
                          <template v-slot:title>
                            <span class="font-weight-normal">Exclusive Student Discount</span>
                          </template>

                          <!---<v-card-text class="bg-surface-light pt-4"> </v-card-text>-->
                          <v-img src="/images/for_rent.png" class="mx-auto" cover></v-img>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3" class="mt-10">
                        <v-card
                          class="mx-auto"
                          prepend-icon="mdi-creation-outline"
                          subtitle="Rented cameras are well-maintained"
                          height="400px"
                          style="border-radius: 20px"
                          variant="outlined"
                        >
                          <template v-slot:title>
                            <span class="font-weight-normal">Maintenance and Care</span>
                          </template>

                          <v-img src="/images/care.png" class="mx-auto" cover></v-img>

                          <!---<v-card-text class="bg-surface-light pt-4"> </v-card-text>-->
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3" class="mt-10 reduce-gap">
                        <v-card
                          class="mx-auto"
                          prepend-icon="mdi-camera-plus-outline"
                          subtitle="Quality-checked cameras"
                          height="400px"
                          style="border-radius: 20px"
                          variant="outlined"
                        >
                          <template v-slot:title>
                            <span class="font-weight-normal">Verified Listings</span>
                          </template>

                          <v-img src="/images/quality.png" class="mx-auto" cover></v-img>

                          <!---<v-card-text class="bg-surface-light pt-4"> </v-card-text>-->
                        </v-card>
                      </v-col>
                    </v-row>

                    <!--Row 5-->
                    <v-col cols="12" md="3" class="mt-10"></v-col>
                    <v-col cols="12" md="6" class="mt-10">
                      <i
                        ><p class="mt-2 mb-10">
                          "Renting a Camera Has Never Been Easier. Access professional-grade
                          equipment without the hassle of ownership. Whether capturing memories or
                          working on creative projects, our platform offers high-quality cameras,
                          flexible rentals, secure transactions, and excellent support. Bring your
                          vision to life effortlessly."
                        </p>
                      </i>
                    </v-col>
                    <v-col cols="12" md="3" class="mt-10"></v-col>

                    <v-divider></v-divider>

                    <!--Developers-->
                    <v-col id="developers" cols="12" md="1"></v-col>
                  </v-row>
                </v-container>
              </v-main>
            </v-card>
          </v-layout>
        </v-col>
      </v-row>
    </v-container-fluid>
  </v-responsive>
</template>
