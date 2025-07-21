//
//  HomeView.swift
//  homelib-ios
//
//  Created by Matthew Chen on 7/20/25.
//

import SwiftUI
import Foundation
import Combine

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()

    var body: some View {
        
        VStack(alignment: .leading, spacing: 16) {
            HomeDropdownView()
         
            if let error = viewModel.errorMessage {
                Text(error)
                    .foregroundColor(.red)
            }
            
            FileGridView(files: viewModel.files)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .onAppear {
            viewModel.fetchFiles()
        }
    }
}



struct HomePreview : View {
    @State var text = ""
    var body: some View {
        HomeView()
    }
    
}

#Preview {
    HomePreview()
}
