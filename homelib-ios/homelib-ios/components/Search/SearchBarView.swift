//
//  SearchBarView.swift
//  homelib-ios
//
//  Created by Matthew Chen on 7/20/25.
//
import SwiftUI


struct SearchBarView : View {
    @Binding var searchText : String
    @State var isOpen : Bool = false
    
    var body: some View {
        ZStack(alignment: .leading) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: "line.3.horizontal")
                        .foregroundColor(.gray)
                        .onTapGesture {
                            isOpen.toggle()
                            if (isOpen) {
                                print("opened")
                            } else {
                                print("closed")
                            }
                        
                            
                        }
                    
                    TextField("Search in HomeLib", text: $searchText)
                        .textFieldStyle(PlainTextFieldStyle())
                        .autocorrectionDisabled(true)
                        .foregroundColor(.white)
                        
                }
                .frame(maxWidth: .infinity, maxHeight: 25)
                .padding(10)
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.white, lineWidth: 2)
                )
                
            }
            .zIndex(1)
        }
    }
}

struct SearchBarPreview : View {
    @State private var text = ""
    
    var body : some View {
        SearchBarView(searchText: $text)
    }
}

#Preview {
    SearchBarPreview()
}
