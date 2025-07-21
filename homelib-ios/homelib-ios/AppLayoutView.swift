import SwiftUI

enum AppTab {
    case home, files, account
}

struct AppLayoutView : View {
    @State private var selectedTab : AppTab = .home


    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {

                TabView(selection: $selectedTab) {
                    HomeView()
                        .tag(AppTab.home)
                        .tabItem {
                            Label("", systemImage: "house")
                        }

                    MyFilesView()
                        .tag(AppTab.files)
                        .tabItem {
                            Label("", systemImage: "folder")
                        }

                    AccountView()
                        .tag(AppTab.account)
                        .tabItem {
                            Label("", systemImage: "person.circle")
                        }
                }
            }
            .navigationTitle(tabTitle(for: selectedTab))
        }
        
    }

    func tabTitle(for tab: AppTab) -> String {
        switch tab {
        case .home: return "Home"
        case .files: return "My Files"
        case .account: return "Account"
        }
    }
}   

#Preview {
    AppLayoutView()
}
