//
//  MyFiles.swift
//  homelib-ios
//
//  Created by Matthew Chen on 7/20/25.
//

import SwiftUI

struct MyFilesView : View {
    @StateObject var fileGridViewModel = FileGridViewModel()
    @State var searchText = ""
    @State var isOpen = false
    
    var body : some View {
        ZStack(alignment: .leading) {
            VStack(alignment: .leading) {
                MyFilesNavView(viewModel: fileGridViewModel)
                    
 
                SearchBarView(searchText: $searchText, isOpen: $isOpen)
                  
                
                
                
                FileGridView(viewModel: fileGridViewModel)
                  
            }
            .padding()
        }
        .onAppear {
            fileGridViewModel.fetchFiles(path: fileGridViewModel.currentPath)
        }
    }
}

struct MyFilesNavView: View {
    @ObservedObject var viewModel: FileGridViewModel
    
    var body: some View {
        ZStack {
            // Centered title
            Text(viewModel.getDirectory() == nil ? "Files" : "")
                .font(.title)
                .bold()
                .frame(maxWidth: .infinity, alignment: .leading)

            // Left-aligned back button with optional directory name
            HStack(spacing: 15) {
                if viewModel.getDirectory() != nil {
                    Image(systemName: "chevron.left")
                        .font(.title)
                        .bold()

                    Text(viewModel.getDirectory()!)
                        .font(.title)
                        .bold()
                }
            }
            .onTapGesture {
                viewModel.fetchFiles(path: viewModel.goBack())
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            
            HStack(spacing: 10) {
                Image(systemName: "arrow.up.document")
                    .font(.title2)
                Image(systemName: "checkmark.square")
                    .font(.title2)
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(.horizontal)
        .frame(height: 45)
    }
}

#Preview {
    return MyFilesView()
}
