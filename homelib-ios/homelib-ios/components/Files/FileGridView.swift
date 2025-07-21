//
//  FileGridView.swift
//  homelib-ios
//
//  Created by Matthew Chen on 7/20/25.
//

import SwiftUI

struct FileGridView: View {
    @ObservedObject var viewModel: HomeViewModel
    
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(viewModel.files) { file in
                    VStack(spacing: 8) {
                        Image(systemName: file.isDir ? "folder.fill" : "doc.fill")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 40, height: 40)
                            .foregroundColor(file.isDir ? .yellow : .blue)
                        
                        Text(file.name)
                            .font(.caption)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .onTapGesture {
                        if (file.isDir) {
                            viewModel.currentPath = file.path
                            viewModel.fetchFiles()
                        }
                        
                      }
                }
            }
            .padding()
        }
    }
}


