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
                    <v-col cols="12" md="10" class="d-flex justify-center mt-10">
                      <v-img
                        style="width: 20%"
                        src="/images/developers.png"
                        contain
                        max-width="400"
                        max-height="100"
                      ></v-img>
                    </v-col>
                    <v-col col="12" md="1"></v-col>

                    <!--1st row-->
                    <v-row class="justify-center mt-10">
                      <!--Joshua-->
                      <v-col cols="12" md="3">
                        <div class="card">
                          <div class="img">
                            <v-img
                              src="/images/joshua.jpg"
                              cover
                              style="border-radius: 10px"
                            ></v-img>
                          </div>
                          <span>Senior Programmer</span>
                          <p class="info">
                            IT student at Caraga State University with skills in web development,
                            database design, and software development. Certified in CSS, JavaScript,
                            and HTML, with experience in SQL, C, and Java. Passionate about
                            technology and problem-solving.
                          </p>
                          <div class="share">
                            <a href=""
                              ><svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-github"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                                ></path></svg
                            ></a>
                            <a href=""
                              ><svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-twitter"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"
                                ></path></svg
                            ></a>
                            <a href=""
                              ><svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-instagram"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"
                                ></path></svg
                            ></a>
                            <a href=""
                              ><svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-youtube"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"
                                ></path></svg
                            ></a>
                          </div>
                          <button>Resume</button>
                        </div>
                      </v-col>
                    </v-row>
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
