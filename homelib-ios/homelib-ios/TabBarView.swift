import SwiftUI

struct TabBarView : View {
    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
                    .navigationTitle("HomeLib")
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button(action: {
                                print("Hamburger tapped")
                            }) {
                                Image(systemName: "line.3.horizontal")
                                    .imageScale(.large)
                            }
                        }
                    }
            }
            .tabItem {
                Label("Home", systemImage: "house")
            }

            NavigationStack {
                FilesView()
                    .navigationTitle("HomeLib")
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button(action: {
                                print("Hamburger tapped")
                            }) {
                                Image(systemName: "line.3.horizontal")
                                    .imageScale(.large)
                            }
                        }
                    }
            }
            .tabItem {
                Label("Files", systemImage: "folder")
            }
        }
    }
}



struct HomeView: View {
    var body: some View {
        Text("This is the home page")
    }
}

// FilesView.swift
struct FilesView: View {
    var body: some View {
        FileUploadView()
    }
}
