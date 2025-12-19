if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/philipp/.gradle/caches/8.14.3/transforms/f3d279cf13499f4c93e2b512ac9499e6/transformed/hermes-android-0.81.5-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/philipp/.gradle/caches/8.14.3/transforms/f3d279cf13499f4c93e2b512ac9499e6/transformed/hermes-android-0.81.5-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

