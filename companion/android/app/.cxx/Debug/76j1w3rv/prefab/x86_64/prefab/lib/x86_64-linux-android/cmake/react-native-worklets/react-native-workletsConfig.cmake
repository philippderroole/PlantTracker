if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "/home/philipp/Programming/plant-tracker/companion/node_modules/react-native-worklets/android/build/intermediates/cxx/Debug/7314s45v/obj/x86_64/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/philipp/Programming/plant-tracker/companion/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

