//
//  HomeViewModel.swift
//  homelib-ios
//
//  Created by Matthew Chen on 7/20/25.
//
import Foundation
import Combine
import SwiftUICore

struct FileItem: Identifiable, Decodable {
    let fileId: String
    let name: String
    let path: String
    let size: UInt128
    let isDir: Bool
    
    var id: String { fileId }
}


class HomeViewModel: ObservableObject {
    @Published var files: [FileItem] = []
    @Published var errorMessage: String?
    
    @Published var currentPath: String = ""

    func fetchFiles() {
        guard let url = URL(string: "http://localhost:8080/files?path=/\(currentPath)") else {
            errorMessage = "Invalid URL"
            return
        }

        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    self.errorMessage = "Error: \(error.localizedDescription)"
                }
                return
            }

            guard let data = data else {
                DispatchQueue.main.async {
                    self.errorMessage = "No data received"
                }
                return
            }

            do {
                let decodedFiles = try JSONDecoder().decode([FileItem].self, from: data)
                DispatchQueue.main.async {
                    self.files = decodedFiles
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = "Decoding error: \(error.localizedDescription)"
                }
            }
        }.resume()
}
}
