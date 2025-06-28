import 'package:flutter/material.dart';
import 'camera_screen.dart';
import 'dictionary_screen.dart';
import 'main.dart';

class main_page extends StatelessWidget {
  const main_page({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Signfy", style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body:
        GridView.count(
          crossAxisSpacing: 5,
          mainAxisSpacing: 5,
          crossAxisCount: 2,
          children: [
            // Container(margin: EdgeInsets.all(2),),
            // Container(margin: EdgeInsets.all(2),),
            // Container(),
            Padding(padding: EdgeInsets.all(50),child: Image.asset('assets/png/icon3.png',),),
            InkWell(
              onTap: (){Navigator.push(context, MaterialPageRoute(builder: (context)=>CameraScreen()));},
              child: const Card(
                elevation: 4,
                margin: EdgeInsets.all(15),
                child: Center(child: Text("كاميرا مباشرة",style: TextStyle(fontWeight: FontWeight.bold),textScaleFactor: 1.5,),),
              ),
            ),
            InkWell(
              onTap: (){Navigator.push(context, MaterialPageRoute(builder: (context)=>DictionaryScreen()));},
              child: const Card(
                elevation: 4,
                margin: EdgeInsets.all(15),
                child: Center(child: Text("القاموس",style: TextStyle(fontWeight: FontWeight.bold),textScaleFactor: 1.5,),),
              ),
            ),
            Padding(padding: EdgeInsets.all(60),child: Image.asset('assets/png/icon2.png'),)
          ],
        )
      // Center(
      //   child: Row(
      //     children: [
      //       Expanded(child: Container(
      //         child: ElevatedButton(onPressed: (){Navigator.push(context, MaterialPageRoute(builder: (context)=>CameraScreen()));}, child: Text("Live Translation")),
      //         padding: EdgeInsets.all(16),
      //       )),
      //       Expanded(child: Container(
      //         child: ElevatedButton(onPressed: (){}, child: Text("Dictionary")),
      //         padding: EdgeInsets.all(16),
      //       )),
      //     ],
      //   ),
      // ),
    );
  }
}
