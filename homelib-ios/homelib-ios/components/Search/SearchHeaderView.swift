//
//  SearchHeaderView.swift
//  homelib-ios
//
//  Created by Matthew Chen on 7/20/25.
//

import SwiftUI

struct SearchHeaderView: View {
    @State var searchText: String
    
    var body: some View {
     
        HStack {
            SearchBarView(searchText: $searchText)
        }
        .cornerRadius(10)
    }

}

struct SearchHeaderPreview: View {
    @State private var text = ""
    
    var body : some View {
        SearchHeaderView(searchText : text)
    }
}

#Preview {
    SearchHeaderPreview()
}
